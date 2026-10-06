import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  contracts,
  contractTenants,
  invoices,
  meterReadings,
  properties,
  roomAssets,
  roomBeds,
  rooms,
  tenants,
} from "@/db/schema";
import { todayVn } from "@/lib/dates";

export async function listRooms(propertyId: string, period: string) {
  const roomRows = await db
    .select()
    .from(rooms)
    .where(eq(rooms.propertyId, propertyId))
    .orderBy(rooms.floor, rooms.name);
  if (roomRows.length === 0) return [];

  const roomIds = roomRows.map((r) => r.id);
  const today = todayVn();

  const [activeContracts, monthInvoices, beds] = await Promise.all([
    db
      .select({
        roomId: contracts.roomId,
        contractId: contracts.id,
        startDate: contracts.startDate,
        endDate: contracts.endDate,
        bedId: contracts.bedId,
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
      ),
    db
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
      ),
    db
      .select()
      .from(roomBeds)
      .where(and(eq(roomBeds.propertyId, propertyId), inArray(roomBeds.roomId, roomIds)))
      .orderBy(roomBeds.name),
  ]);

  return roomRows.map((room) => {
    const roomActive = activeContracts.filter((a) => a.roomId === room.id);
    const primaryContract = roomActive[0] ?? null;
    const roomBedsList = beds.filter((b) => b.roomId === room.id);

    // Tính hạn hợp đồng sắp hết (trong vòng 30 ngày)
    let isExpiringSoon = false;
    let daysUntilExpire: number | null = null;
    if (primaryContract?.endDate) {
      const ms = Date.parse(primaryContract.endDate) - Date.parse(today);
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      daysUntilExpire = days;
      if (days >= 0 && days <= 30) {
        isExpiringSoon = true;
      }
    }

    // Với KTX/Sleepbox: đếm số giường đã thuê
    const occupiedBedsCount = roomActive.filter((c) => c.bedId !== null).length;

    return {
      ...room,
      tenantName:
        roomActive
          .map((a) => a.tenantName)
          .filter(Boolean)
          .join(", ") || null,
      hasActiveContract: roomActive.length > 0,
      activeContractsCount: roomActive.length,
      contractEndDate: primaryContract?.endDate ?? null,
      isExpiringSoon,
      daysUntilExpire,
      beds: roomBedsList,
      occupiedBedsCount,
      invoice: monthInvoices.find((i) => i.roomId === room.id) ?? null,
    };
  });
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

  const [contractTenantRows, lastReading, monthInvoice, bedsList, assetsList] = await Promise.all([
    contract
      ? db
          .select({
            id: tenants.id,
            fullName: tenants.fullName,
            phone: tenants.phone,
            idNumber: tenants.idNumber,
            birthDate: tenants.birthDate,
            gender: tenants.gender,
            hometown: tenants.hometown,
            workplace: tenants.workplace,
            licensePlate: tenants.licensePlate,
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
      : [],
    db
      .select()
      .from(meterReadings)
      .where(and(eq(meterReadings.propertyId, propertyId), eq(meterReadings.roomId, roomId)))
      .orderBy(desc(meterReadings.period))
      .limit(1)
      .then((res) => res[0] ?? null),
    db
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
      .limit(1)
      .then((res) => res[0] ?? null),
    db
      .select()
      .from(roomBeds)
      .where(and(eq(roomBeds.propertyId, propertyId), eq(roomBeds.roomId, roomId)))
      .orderBy(roomBeds.name),
    db
      .select()
      .from(roomAssets)
      .where(and(eq(roomAssets.propertyId, propertyId), eq(roomAssets.roomId, roomId)))
      .orderBy(roomAssets.category, roomAssets.name),
  ]);

  return {
    room,
    property,
    contract: contract ?? null,
    tenants: contractTenantRows,
    lastReading,
    monthInvoice,
    beds: bedsList,
    assets: assetsList,
  };
}

export type RoomDetail = NonNullable<Awaited<ReturnType<typeof getRoomDetail>>>;
export type RoomListRow = Awaited<ReturnType<typeof listRooms>>[number];
