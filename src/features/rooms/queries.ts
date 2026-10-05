import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  contracts,
  contractTenants,
  invoices,
  meterReadings,
  properties,
  rooms,
  tenants,
} from "@/db/schema";

export async function listRooms(propertyId: string, period: string) {
  const roomRows = await db
    .select()
    .from(rooms)
    .where(eq(rooms.propertyId, propertyId))
    .orderBy(rooms.name);
  if (roomRows.length === 0) return [];

  const roomIds = roomRows.map((r) => r.id);

  const active = await db
    .select({
      roomId: contracts.roomId,
      contractId: contracts.id,
      tenantName: tenants.fullName,
    })
    .from(contracts)
    .leftJoin(
      contractTenants,
      and(eq(contractTenants.contractId, contracts.id), eq(contractTenants.isPrimary, "yes")),
    )
    .leftJoin(tenants, eq(tenants.id, contractTenants.tenantId))
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.status, "active"),
        isNull(contracts.deletedAt),
        inArray(contracts.roomId, roomIds),
      ),
    );

  const monthInvoices = await db
    .select({
      id: invoices.id,
      roomId: invoices.roomId,
      total: invoices.total,
      paidAmount: invoices.paidAmount,
      status: invoices.status,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.period, period),
        isNull(invoices.deletedAt),
      ),
    );

  return roomRows.map((room) => ({
    ...room,
    tenantName: active.find((a) => a.roomId === room.id)?.tenantName ?? null,
    hasActiveContract: active.some((a) => a.roomId === room.id),
    invoice: monthInvoices.find((i) => i.roomId === room.id) ?? null,
  }));
}

export async function getRoomDetail(propertyId: string, roomId: string, period: string) {
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, roomId)))
    .limit(1);
  if (!room) return null;

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  const [contract] = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.roomId, roomId),
        eq(contracts.status, "active"),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);

  const contractTenantRows = contract
    ? await db
        .select({
          id: tenants.id,
          fullName: tenants.fullName,
          phone: tenants.phone,
          idNumber: tenants.idNumber,
          userId: tenants.userId,
        })
        .from(contractTenants)
        .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
        .where(
          and(
            eq(contractTenants.propertyId, propertyId),
            eq(contractTenants.contractId, contract.id),
          ),
        )
    : [];

  const [lastReading] = await db
    .select()
    .from(meterReadings)
    .where(and(eq(meterReadings.propertyId, propertyId), eq(meterReadings.roomId, roomId)))
    .orderBy(desc(meterReadings.period))
    .limit(1);

  const [monthInvoice] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.roomId, roomId),
        eq(invoices.period, period),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);

  return {
    room,
    property,
    contract: contract ?? null,
    tenants: contractTenantRows,
    lastReading: lastReading ?? null,
    monthInvoice: monthInvoice ?? null,
  };
}
