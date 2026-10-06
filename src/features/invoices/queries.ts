import "server-only";
import { and, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  contractTenants,
  contracts,
  invoices,
  meterReadings,
  payments,
  properties,
  rooms,
  tenants,
} from "@/db/schema";

export type InvoiceListItem = {
  id: string;
  roomId: string;
  roomName: string;
  floor: number | null;
  roomType: string;
  period: string;
  total: number;
  paidAmount: number;
  status: "unpaid" | "partial" | "paid";
  dueDate: string;
  createdAt: Date;
  contractId: string;
  roomFee: number;
  electricAmount: number;
  electricUsage: number;
  electricPrev: number | null;
  electricCurr: number | null;
  waterAmount: number;
  waterUsage: number;
  waterPrev: number | null;
  waterCurr: number | null;
  otherFee: number;
  otherFeeNote: string | null;
  tenantName: string | null;
  tenantPhone: string | null;
};

export async function listInvoices(propertyId: string): Promise<InvoiceListItem[]> {
  const invoiceRows = await db
    .select({
      id: invoices.id,
      roomId: invoices.roomId,
      period: invoices.period,
      roomName: rooms.name,
      floor: rooms.floor,
      roomType: rooms.roomType,
      total: invoices.total,
      paidAmount: invoices.paidAmount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      contractId: invoices.contractId,
      roomFee: invoices.roomFee,
      electricAmount: invoices.electricAmount,
      electricUsage: invoices.electricUsage,
      electricPrev: meterReadings.electricPrev,
      electricCurr: meterReadings.electricCurr,
      waterAmount: invoices.waterAmount,
      waterUsage: invoices.waterUsage,
      waterPrev: meterReadings.waterPrev,
      waterCurr: meterReadings.waterCurr,
      otherFee: invoices.otherFee,
      otherFeeNote: invoices.otherFeeNote,
    })
    .from(invoices)
    .innerJoin(rooms, eq(rooms.id, invoices.roomId))
    .leftJoin(
      meterReadings,
      and(
        eq(meterReadings.propertyId, propertyId),
        eq(meterReadings.roomId, invoices.roomId),
        eq(meterReadings.period, invoices.period),
      ),
    )
    .where(and(eq(invoices.propertyId, propertyId), isNull(invoices.deletedAt)))
    .orderBy(desc(invoices.period), desc(invoices.createdAt), rooms.name);

  if (invoiceRows.length === 0) return [];

  // Lấy danh sách khách thuê chính theo từng contractId
  const contractIds = [...new Set(invoiceRows.map((i) => i.contractId))];
  const primaryTenants = await db
    .select({
      contractId: contractTenants.contractId,
      fullName: tenants.fullName,
      phone: tenants.phone,
    })
    .from(contractTenants)
    .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
    .where(
      and(
        eq(contractTenants.propertyId, propertyId),
        eq(contractTenants.isPrimary, "yes"),
        inArray(contractTenants.contractId, contractIds),
      ),
    );

  const tenantMap = new Map(primaryTenants.map((t) => [t.contractId, t]));

  return invoiceRows.map((inv) => {
    const t = tenantMap.get(inv.contractId);
    return {
      ...inv,
      tenantName: t?.fullName ?? null,
      tenantPhone: t?.phone ?? null,
    };
  });
}

export async function getInvoiceDetail(propertyId: string, invoiceId: string) {
  const [row] = await db
    .select({ invoice: invoices, roomName: rooms.name, propertyName: properties.name })
    .from(invoices)
    .innerJoin(rooms, eq(rooms.id, invoices.roomId))
    .innerJoin(properties, eq(properties.id, invoices.propertyId))
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.id, invoiceId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  if (!row) return null;

  const [tenant, paymentRows, [reading]] = await Promise.all([
    db
      .select({ fullName: tenants.fullName, phone: tenants.phone })
      .from(contractTenants)
      .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
      .where(
        and(
          eq(contractTenants.propertyId, propertyId),
          eq(contractTenants.contractId, row.invoice.contractId),
          eq(contractTenants.isPrimary, "yes"),
        ),
      )
      .limit(1)
      .then((res) => res[0] ?? null),
    db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.propertyId, propertyId),
          eq(payments.invoiceId, invoiceId),
          isNull(payments.deletedAt),
        ),
      )
      .orderBy(desc(payments.paidAt)),
    db
      .select()
      .from(meterReadings)
      .where(
        and(
          eq(meterReadings.propertyId, propertyId),
          eq(meterReadings.roomId, row.invoice.roomId),
          eq(meterReadings.period, row.invoice.period),
        ),
      )
      .limit(1),
  ]);

  return {
    ...row,
    tenantName: tenant?.fullName ?? null,
    tenantPhone: tenant?.phone ?? null,
    payments: paymentRows,
    reading: reading ?? null,
  };
}

export type BatchRoomCandidate = {
  roomId: string;
  roomName: string;
  floor: number | null;
  contractId: string;
  tenantName: string | null;
  tenantPhone: string | null;
  rentPrice: number;
  electricPrev: number;
  waterPrev: number;
  alreadyInvoiced: boolean;
  existingInvoiceId?: string;
};

export async function getBatchInvoiceContext(propertyId: string, period: string) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!property) return null;

  const periodStart = `${period}-01`;

  // Lấy các hợp đồng có hiệu lực trong kỳ
  const activeContracts = await db
    .select({
      contractId: contracts.id,
      roomId: contracts.roomId,
      roomName: rooms.name,
      floor: rooms.floor,
      rentPrice: contracts.rentPrice,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
    })
    .from(contracts)
    .innerJoin(rooms, eq(rooms.id, contracts.roomId))
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        isNull(contracts.deletedAt),
        sql`${contracts.startDate} <= ${periodStart} AND (${contracts.endDate} IS NULL OR ${contracts.endDate} >= ${periodStart})`,
      ),
    )
    .orderBy(rooms.name);

  // Lấy hóa đơn đã lập cho kỳ này
  const existingInvoices = await db
    .select({ id: invoices.id, roomId: invoices.roomId })
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.period, period),
        isNull(invoices.deletedAt),
      ),
    );

  const invoiceMap = new Map(existingInvoices.map((i) => [i.roomId, i.id]));

  // Lấy khách thuê chính
  const primaryTenants = await db
    .select({
      contractId: contractTenants.contractId,
      fullName: tenants.fullName,
      phone: tenants.phone,
    })
    .from(contractTenants)
    .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
    .where(and(eq(contractTenants.propertyId, propertyId), eq(contractTenants.isPrimary, "yes")));
  const tenantMap = new Map(primaryTenants.map((t) => [t.contractId, t]));

  // Lấy chỉ số đồng hồ gần nhất trước kỳ này cho từng phòng
  const candidates: BatchRoomCandidate[] = [];

  for (const c of activeContracts) {
    const [lastReading] = await db
      .select()
      .from(meterReadings)
      .where(
        and(
          eq(meterReadings.propertyId, propertyId),
          eq(meterReadings.roomId, c.roomId),
          lt(meterReadings.period, period),
        ),
      )
      .orderBy(desc(meterReadings.period))
      .limit(1);

    const tenant = tenantMap.get(c.contractId);
    const existingId = invoiceMap.get(c.roomId);

    candidates.push({
      roomId: c.roomId,
      roomName: c.roomName,
      floor: c.floor,
      contractId: c.contractId,
      tenantName: tenant?.fullName ?? null,
      tenantPhone: tenant?.phone ?? null,
      rentPrice: c.rentPrice,
      electricPrev: lastReading?.electricCurr ?? 0,
      waterPrev: lastReading?.waterCurr ?? 0,
      alreadyInvoiced: Boolean(existingId),
      existingInvoiceId: existingId,
    });
  }

  return {
    property,
    period,
    candidates,
  };
}
