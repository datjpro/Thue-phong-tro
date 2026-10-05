import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contracts, contractTenants, rooms, tenants } from "@/db/schema";

export async function listTenants(propertyId: string) {
  const tenantRows = await db
    .select({
      id: tenants.id,
      fullName: tenants.fullName,
      phone: tenants.phone,
      idNumber: tenants.idNumber,
      userId: tenants.userId,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .where(and(eq(tenants.propertyId, propertyId), isNull(tenants.deletedAt)))
    .orderBy(tenants.fullName);

  if (tenantRows.length === 0) return [];

  // Tìm phòng đang thuê của từng người thuê
  const activeContracts = await db
    .select({
      tenantId: contractTenants.tenantId,
      roomId: contracts.roomId,
      roomName: rooms.name,
    })
    .from(contractTenants)
    .innerJoin(contracts, eq(contracts.id, contractTenants.contractId))
    .innerJoin(rooms, eq(rooms.id, contracts.roomId))
    .where(
      and(
        eq(contractTenants.propertyId, propertyId),
        eq(contracts.status, "active"),
        isNull(contracts.deletedAt),
      ),
    );

  return tenantRows.map((t) => {
    const active = activeContracts.find((c) => c.tenantId === t.id);
    return {
      ...t,
      roomId: active?.roomId ?? null,
      roomName: active?.roomName ?? null,
    };
  });
}
