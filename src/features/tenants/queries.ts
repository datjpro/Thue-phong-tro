import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contracts, contractTenants, properties, rooms, tenants } from "@/db/schema";

export async function listTenants(propertyId: string) {
  const tenantRows = await db
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
      idCardFrontUrl: tenants.idCardFrontUrl,
      idCardBackUrl: tenants.idCardBackUrl,
      notes: tenants.notes,
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
      contractId: contracts.id,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
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

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  return tenantRows.map((t) => {
    const active = activeContracts.find((c) => c.tenantId === t.id);
    return {
      ...t,
      roomId: active?.roomId ?? null,
      roomName: active?.roomName ?? null,
      contractId: active?.contractId ?? null,
      startDate: active?.startDate ?? null,
      endDate: active?.endDate ?? null,
      propertyName: property?.name ?? "Nhà trọ",
      propertyAddress: property?.address ?? "",
    };
  });
}

export type TenantRow = Awaited<ReturnType<typeof listTenants>>[number];
