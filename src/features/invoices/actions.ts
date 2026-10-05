"use server";

import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contracts, invoices, meterReadings, payments, properties, rooms } from "@/db/schema";
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

  const calc = calculateInvoice({
    period: v.period,
    monthlyRent: contract.rentPrice,
    contractStart: contract.startDate,
    contractEnd: contract.endDate,
    electric: { prev: electricPrev, curr: v.electricCurr, unitPrice: property.electricPrice },
    water: { prev: waterPrev, curr: v.waterCurr, unitPrice: property.waterPrice },
    otherFee: v.otherFee,
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
      })
      .onConflictDoUpdate({
        target: [meterReadings.roomId, meterReadings.period],
        set: {
          electricPrev,
          electricCurr: v.electricCurr,
          waterPrev,
          waterCurr: v.waterCurr,
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
