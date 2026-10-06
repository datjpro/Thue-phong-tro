import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contracts, contractTenants, properties, roomBeds, rooms, tenants } from "@/db/schema";
import { todayVn } from "@/lib/dates";

export async function listContracts(propertyId: string) {
  const today = todayVn();
  const rows = await db
    .select({
      id: contracts.id,
      roomId: contracts.roomId,
      roomName: rooms.name,
      bedId: contracts.bedId,
      contractNumber: contracts.contractNumber,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      rentPrice: contracts.rentPrice,
      deposit: contracts.deposit,
      billingCycle: contracts.billingCycle,
      terms: contracts.terms,
      status: contracts.status,
      tenantName: tenants.fullName,
      tenantPhone: tenants.phone,
      tenantIdNumber: tenants.idNumber,
    })
    .from(contracts)
    .innerJoin(rooms, eq(rooms.id, contracts.roomId))
    .leftJoin(
      contractTenants,
      and(eq(contractTenants.contractId, contracts.id), eq(contractTenants.isPrimary, "yes")),
    )
    .leftJoin(tenants, eq(tenants.id, contractTenants.tenantId))
    .where(and(eq(contracts.propertyId, propertyId), isNull(contracts.deletedAt)))
    .orderBy(desc(contracts.startDate));

  return rows.map((c) => {
    let isExpiringSoon = false;
    let daysRemaining: number | null = null;
    if (c.status === "active" && c.endDate) {
      const ms = Date.parse(c.endDate) - Date.parse(today);
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      daysRemaining = days;
      if (days >= 0 && days <= 30) {
        isExpiringSoon = true;
      }
    }

    return {
      ...c,
      isExpiringSoon,
      daysRemaining,
    };
  });
}

export async function getContractDetail(propertyId: string, contractId: string) {
  const [contract] = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.id, contractId),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);
  if (!contract) return null;

  const [room, property, contractTenantsList] = await Promise.all([
    db
      .select()
      .from(rooms)
      .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, contract.roomId)))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1)
      .then((p) => p[0]),
    db
      .select({
        id: tenants.id,
        fullName: tenants.fullName,
        phone: tenants.phone,
        idNumber: tenants.idNumber,
        birthDate: tenants.birthDate,
        gender: tenants.gender,
        hometown: tenants.hometown,
        workplace: tenants.workplace,
        isPrimary: contractTenants.isPrimary,
      })
      .from(contractTenants)
      .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
      .where(
        and(
          eq(contractTenants.propertyId, propertyId),
          eq(contractTenants.contractId, contract.id),
        ),
      ),
  ]);

  let bed = null;
  if (contract.bedId) {
    const [b] = await db
      .select()
      .from(roomBeds)
      .where(and(eq(roomBeds.propertyId, propertyId), eq(roomBeds.id, contract.bedId)))
      .limit(1);
    bed = b ?? null;
  }

  return {
    contract,
    room,
    property,
    bed,
    tenants: contractTenantsList,
  };
}

export async function getContractFormOptions(propertyId: string) {
  const [allRooms, allTenants, allBeds, busy] = await Promise.all([
    db
      .select({
        id: rooms.id,
        name: rooms.name,
        rentPrice: rooms.rentPrice,
        roomType: rooms.roomType,
      })
      .from(rooms)
      .where(eq(rooms.propertyId, propertyId))
      .orderBy(rooms.name),
    db
      .select({ id: tenants.id, fullName: tenants.fullName, phone: tenants.phone })
      .from(tenants)
      .where(and(eq(tenants.propertyId, propertyId), isNull(tenants.deletedAt)))
      .orderBy(tenants.fullName),
    db
      .select({
        id: roomBeds.id,
        roomId: roomBeds.roomId,
        name: roomBeds.name,
        rentPrice: roomBeds.rentPrice,
        status: roomBeds.status,
      })
      .from(roomBeds)
      .where(eq(roomBeds.propertyId, propertyId)),
    db
      .select({ roomId: contracts.roomId, bedId: contracts.bedId })
      .from(contracts)
      .where(
        and(
          eq(contracts.propertyId, propertyId),
          eq(contracts.status, "active"),
          isNull(contracts.deletedAt),
        ),
      ),
  ]);

  return {
    rooms: allRooms,
    tenants: allTenants,
    beds: allBeds,
    busyRoomIds: busy.map((b) => b.roomId),
  };
}

export type ContractRow = Awaited<ReturnType<typeof listContracts>>[number];
