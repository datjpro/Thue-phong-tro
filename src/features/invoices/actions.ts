"use server";

import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  contractTenants,
  contracts,
  invoices,
  meterReadings,
  payments,
  properties,
  rooms,
} from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { dueDateFor } from "@/lib/dates";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertManager, requireContext } from "@/lib/session";
import { calculateInvoice, paymentStatus } from "./calculate";
import { type PaymentInput, type ReadingInput, paymentSchema, readingSchema } from "./schemas";

export async function saveReadingAndCreateInvoice(
  propertyId: string,
  input: ReadingInput,
): Promise<ActionResult<{ invoiceId: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`invoice:${ctx.userId}`, { limit: 30, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = readingSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, v.roomId)))
    .limit(1);
  if (!room) return fail("notFound");

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!property) return fail("notFound");

  // Hợp đồng đang hiệu lực, hoặc hợp đồng vừa kết thúc có phủ kỳ này (tháng cuối).
  const periodStart = `${v.period}-01`;
  const contractRows = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.roomId, v.roomId),
        isNull(contracts.deletedAt),
      ),
    )
    .orderBy(desc(contracts.startDate));
  const contract = contractRows.find(
    (c) => c.startDate.slice(0, 7) <= v.period && (c.endDate === null || c.endDate >= periodStart),
  );
  if (!contract) return fail("noContract");

  const [dup] = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.roomId, v.roomId),
        eq(invoices.period, v.period),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  if (dup) return fail("invoiceExists");

  // Chỉ số cũ lấy từ kỳ trước (nguồn đáng tin), trừ khi người dùng chọn "Thay đồng hồ".
  const [last] = await db
    .select()
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.propertyId, propertyId),
        eq(meterReadings.roomId, v.roomId),
        lt(meterReadings.period, v.period),
      ),
    )
    .orderBy(desc(meterReadings.period))
    .limit(1);

  const electricPrev = v.electricReplaced ? v.electricPrev : (last?.electricCurr ?? v.electricPrev);
  const waterPrev = v.waterReplaced ? v.waterPrev : (last?.waterCurr ?? v.waterPrev);
  if (v.electricCurr < electricPrev || v.waterCurr < waterPrev) return fail("readingLower");

  // Đếm số người thuê trong phòng để tính nước theo đầu người (nếu cấu hình)
  const tenantCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractTenants)
    .where(
      and(eq(contractTenants.propertyId, propertyId), eq(contractTenants.contractId, contract.id)),
    )
    .then((res) => res[0]?.count ?? 1);

  const calc = calculateInvoice({
    period: v.period,
    monthlyRent: contract.rentPrice,
    contractStart: contract.startDate,
    contractEnd: contract.endDate,
    electric: {
      prev: electricPrev,
      curr: v.electricCurr,
      unitPrice: property.electricPrice,
      pricingType: property.electricPricingType as "fixed" | "tiered",
    },
    water: {
      prev: waterPrev,
      curr: v.waterCurr,
      unitPrice: property.waterPrice,
      pricingType: property.waterPricingType as "meter" | "per_person",
      personCount: tenantCount,
      pricePerPerson: property.waterPricePerPerson,
    },
    otherFee: v.otherFee,
    serviceItems: v.serviceItems,
  });

  const invoiceId = await db.transaction(async (tx) => {
    await tx
      .insert(meterReadings)
      .values({
        propertyId,
        roomId: v.roomId,
        period: v.period,
        electricPrev,
        electricCurr: v.electricCurr,
        waterPrev,
        waterCurr: v.waterCurr,
        electricPhoto: v.electricPhoto || null,
        waterPhoto: v.waterPhoto || null,
      })
      .onConflictDoUpdate({
        target: [meterReadings.roomId, meterReadings.period],
        set: {
          electricPrev,
          electricCurr: v.electricCurr,
          waterPrev,
          waterCurr: v.waterCurr,
          electricPhoto: v.electricPhoto || null,
          waterPhoto: v.waterPhoto || null,
        },
      });

    const [inv] = await tx
      .insert(invoices)
      .values({
        propertyId,
        roomId: v.roomId,
        contractId: contract.id,
        period: v.period,
        roomFee: calc.roomFee,
        electricUsage: calc.electricUsage,
        electricUnitPrice: property.electricPrice,
        electricAmount: calc.electricAmount,
        waterUsage: calc.waterUsage,
        waterUnitPrice: property.waterPrice,
        waterAmount: calc.waterAmount,
        otherFee: calc.otherFee,
        otherFeeNote: v.otherFeeNote || null,
        total: calc.total,
        dueDate: dueDateFor(v.period, property.dueDay),
      })
      .returning({ id: invoices.id });
    return inv.id;
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_invoice",
    resourceType: "invoice",
    resourceId: invoiceId,
    details: { roomId: v.roomId, period: v.period, total: calc.total },
  });

  revalidatePath("/", "layout");
  return success({ invoiceId });
}

async function recalcInvoice(tx: Pick<typeof db, "select" | "update">, invoiceId: string) {
  const [{ paid }] = await tx
    .select({ paid: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
    .from(payments)
    .where(and(eq(payments.invoiceId, invoiceId), isNull(payments.deletedAt)));
  const [inv] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  await tx
    .update(invoices)
    .set({ paidAmount: paid, status: paymentStatus(inv.total, paid) })
    .where(eq(invoices.id, invoiceId));
}

export async function recordPayment(
  propertyId: string,
  input: PaymentInput,
): Promise<ActionResult<{ paymentId: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`payment:${ctx.userId}`, { limit: 30, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [inv] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.id, v.invoiceId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  if (!inv) return fail("notFound");
  if (v.amount > inv.total - inv.paidAmount) return fail("overpay");

  const paymentId = await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(payments)
      .values({ propertyId, invoiceId: v.invoiceId, amount: v.amount, method: v.method })
      .returning({ id: payments.id });
    await recalcInvoice(tx, v.invoiceId);
    return p.id;
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "record_payment",
    resourceType: "payment",
    resourceId: paymentId,
    details: { invoiceId: v.invoiceId, amount: v.amount, method: v.method },
  });

  revalidatePath("/", "layout");
  return success({ paymentId });
}

/** Hoàn tác trong vài giây sau khi ghi nhận (UX-UI 6.2). Xóa mềm để còn dấu vết. */
export async function undoPayment(propertyId: string, paymentId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const [p] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.propertyId, propertyId),
        eq(payments.id, paymentId),
        isNull(payments.deletedAt),
      ),
    )
    .limit(1);
  if (!p) return fail("notFound");

  await db.transaction(async (tx) => {
    await tx.update(payments).set({ deletedAt: new Date() }).where(eq(payments.id, paymentId));
    await recalcInvoice(tx, p.invoiceId);
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "undo_payment",
    resourceType: "payment",
    resourceId: paymentId,
    details: { invoiceId: p.invoiceId, amount: p.amount },
  });

  revalidatePath("/", "layout");
  return success(undefined);
}

export async function deleteInvoice(propertyId: string, invoiceId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.id, invoiceId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);

  if (!inv) return fail("notFound");

  await db.transaction(async (tx) => {
    await tx.update(invoices).set({ deletedAt: new Date() }).where(eq(invoices.id, invoiceId));
    await tx
      .update(payments)
      .set({ deletedAt: new Date() })
      .where(and(eq(payments.invoiceId, invoiceId), isNull(payments.deletedAt)));
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "delete_invoice",
    resourceType: "invoice",
    resourceId: invoiceId,
    details: { period: inv.period, roomId: inv.roomId, total: inv.total },
  });

  revalidatePath("/", "layout");
  return success(undefined);
}

export async function recordQuickPayment(
  propertyId: string,
  invoiceId: string,
  method: "cash" | "transfer" = "cash",
  customAmount?: number,
): Promise<ActionResult<{ paymentId: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.id, invoiceId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);

  if (!inv) return fail("notFound");

  const remaining = inv.total - inv.paidAmount;
  if (remaining <= 0) return fail("overpay");

  const amountToPay =
    customAmount && customAmount > 0 && customAmount <= remaining ? customAmount : remaining;

  const paymentId = await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(payments)
      .values({ propertyId, invoiceId, amount: amountToPay, method })
      .returning({ id: payments.id });
    await recalcInvoice(tx, invoiceId);
    return p.id;
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "record_payment",
    resourceType: "payment",
    resourceId: paymentId,
    details: { invoiceId, amount: amountToPay, method, quick: true },
  });

  revalidatePath("/", "layout");
  return success({ paymentId });
}

export async function recordBulkPayments(
  propertyId: string,
  invoiceIds: string[],
  method: "cash" | "transfer" = "transfer",
): Promise<ActionResult<{ paidCount: number }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  if (!invoiceIds || invoiceIds.length === 0) return fail("invalidInput");

  let paidCount = 0;

  await db.transaction(async (tx) => {
    for (const invId of invoiceIds) {
      const [inv] = await tx
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.propertyId, propertyId),
            eq(invoices.id, invId),
            isNull(invoices.deletedAt),
          ),
        )
        .limit(1);

      if (!inv) continue;

      const remaining = inv.total - inv.paidAmount;
      if (remaining <= 0) continue;

      await tx.insert(payments).values({
        propertyId,
        invoiceId: invId,
        amount: remaining,
        method,
      });

      const [{ paid }] = await tx
        .select({ paid: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
        .from(payments)
        .where(and(eq(payments.invoiceId, invId), isNull(payments.deletedAt)));

      await tx
        .update(invoices)
        .set({ paidAmount: paid, status: paymentStatus(inv.total, paid) })
        .where(eq(invoices.id, invId));

      paidCount++;
    }
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "record_payment",
    resourceType: "invoice",
    resourceId: invoiceIds.join(","),
    details: { count: paidCount, method, bulk: true },
  });

  revalidatePath("/", "layout");
  return success({ paidCount });
}

export type BatchReadingItem = {
  roomId: string;
  electricCurr: number;
  waterCurr: number;
  otherFee?: number;
  otherFeeNote?: string | null;
};

export async function saveBatchReadingsAndCreateInvoices(
  propertyId: string,
  period: string,
  items: BatchReadingItem[],
): Promise<ActionResult<{ createdCount: number }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!property) return fail("notFound");

  let createdCount = 0;
  const periodStart = `${period}-01`;

  await db.transaction(async (tx) => {
    for (const item of items) {
      // Bỏ qua nếu không có số liệu hợp lệ
      if (item.electricCurr < 0 || item.waterCurr < 0) continue;

      // Kiểm tra xem đã có hóa đơn chưa
      const [dup] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(
          and(
            eq(invoices.propertyId, propertyId),
            eq(invoices.roomId, item.roomId),
            eq(invoices.period, period),
            isNull(invoices.deletedAt),
          ),
        )
        .limit(1);

      if (dup) continue; // Đã lập hóa đơn rồi thì bỏ qua

      // Tìm hợp đồng hiệu lực
      const contractRows = await tx
        .select()
        .from(contracts)
        .where(
          and(
            eq(contracts.propertyId, propertyId),
            eq(contracts.roomId, item.roomId),
            isNull(contracts.deletedAt),
          ),
        )
        .orderBy(desc(contracts.startDate));

      const contract = contractRows.find(
        (c) =>
          c.startDate.slice(0, 7) <= period && (c.endDate === null || c.endDate >= periodStart),
      );
      if (!contract) continue;

      // Tìm chỉ số cũ
      const [last] = await tx
        .select()
        .from(meterReadings)
        .where(
          and(
            eq(meterReadings.propertyId, propertyId),
            eq(meterReadings.roomId, item.roomId),
            lt(meterReadings.period, period),
          ),
        )
        .orderBy(desc(meterReadings.period))
        .limit(1);

      const electricPrev = last?.electricCurr ?? 0;
      const waterPrev = last?.waterCurr ?? 0;

      // Tính số người thuê
      const tenantCount = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(contractTenants)
        .where(
          and(
            eq(contractTenants.propertyId, propertyId),
            eq(contractTenants.contractId, contract.id),
          ),
        )
        .then((res) => res[0]?.count ?? 1);

      const calc = calculateInvoice({
        period,
        monthlyRent: contract.rentPrice,
        contractStart: contract.startDate,
        contractEnd: contract.endDate,
        electric: {
          prev: electricPrev,
          curr: item.electricCurr,
          unitPrice: property.electricPrice,
          pricingType: property.electricPricingType as "fixed" | "tiered",
        },
        water: {
          prev: waterPrev,
          curr: item.waterCurr,
          unitPrice: property.waterPrice,
          pricingType: property.waterPricingType as "meter" | "per_person",
          personCount: tenantCount,
          pricePerPerson: property.waterPricePerPerson,
        },
        otherFee: item.otherFee || 0,
      });

      await tx
        .insert(meterReadings)
        .values({
          propertyId,
          roomId: item.roomId,
          period,
          electricPrev,
          electricCurr: item.electricCurr,
          waterPrev,
          waterCurr: item.waterCurr,
        })
        .onConflictDoUpdate({
          target: [meterReadings.roomId, meterReadings.period],
          set: {
            electricPrev,
            electricCurr: item.electricCurr,
            waterPrev,
            waterCurr: item.waterCurr,
          },
        });

      await tx.insert(invoices).values({
        propertyId,
        roomId: item.roomId,
        contractId: contract.id,
        period,
        roomFee: calc.roomFee,
        electricUsage: calc.electricUsage,
        electricUnitPrice: property.electricPrice,
        electricAmount: calc.electricAmount,
        waterUsage: calc.waterUsage,
        waterUnitPrice: property.waterPrice,
        waterAmount: calc.waterAmount,
        otherFee: calc.otherFee,
        otherFeeNote: item.otherFeeNote || null,
        total: calc.total,
        dueDate: dueDateFor(period, property.dueDay),
      });

      createdCount++;
    }
  });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_invoice",
    resourceType: "invoice",
    resourceId: `batch-${period}`,
    details: { period, createdCount },
  });

  revalidatePath("/", "layout");
  return success({ createdCount });
}
