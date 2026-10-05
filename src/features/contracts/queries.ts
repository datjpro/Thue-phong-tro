import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contracts, contractTenants, rooms, tenants } from "@/db/schema";

export async function listContracts(propertyId: string) {
  const rows = await db
    .select({
      id: contracts.id,
      roomName: rooms.name,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      rentPrice: contracts.rentPrice,
      status: contracts.status,
      tenantName: tenants.fullName,
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
  return rows;
}

export async function getContractFormOptions(propertyId: string) {
  const [allRooms, allTenants, busy] = await Promise.all([
    db
      .select({ id: rooms.id, name: rooms.name, rentPrice: rooms.rentPrice })
      .from(rooms)
      .where(eq(rooms.propertyId, propertyId))
      .orderBy(rooms.name),
    db
      .select({ id: tenants.id, fullName: tenants.fullName })
      .from(tenants)
      .where(and(eq(tenants.propertyId, propertyId), isNull(tenants.deletedAt)))
      .orderBy(tenants.fullName),
    db
      .select({ roomId: contracts.roomId })
      .from(contracts)
      .where(
        and(
          eq(contracts.propertyId, propertyId),
          eq(contracts.status, "active"),
          isNull(contracts.deletedAt),
        ),
      ),
  ]);
  const busyIds = new Set(busy.map((b) => b.roomId));
  return { rooms: allRooms.filter((r) => !busyIds.has(r.id)), tenants: allTenants };
}
