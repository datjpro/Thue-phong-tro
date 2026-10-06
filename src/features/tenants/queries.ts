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
      floor: rooms.floor,
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

  const result = tenantRows.map((t) => {
    const active = activeContracts.find((c) => c.tenantId === t.id);
    return {
      ...t,
      roomId: active?.roomId ?? null,
      roomName: active?.roomName ?? null,
      floor: active?.floor ?? null,
      contractId: active?.contractId ?? null,
      startDate: active?.startDate ?? null,
      endDate: active?.endDate ?? null,
      propertyName: property?.name ?? "Nhà trọ",
      propertyAddress: property?.address ?? "",
    };
  });

  // Sắp xếp lại theo tầng (Tầng 1 -> Tầng 2...), sau đó theo phòng, rồi đến họ tên
  return result.sort((a, b) => {
    // Nếu cả 2 đều có phòng
    if (a.roomName && b.roomName) {
      const floorA = a.floor ?? 999;
      const floorB = b.floor ?? 999;
      if (floorA !== floorB) return floorA - floorB;
      const roomComp = a.roomName.localeCompare(b.roomName, "vi", { numeric: true });
      if (roomComp !== 0) return roomComp;
      return a.fullName.localeCompare(b.fullName, "vi");
    }
    // Người có phòng xếp trước người chưa gán phòng
    if (a.roomName && !b.roomName) return -1;
    if (!a.roomName && b.roomName) return 1;
    // Cả 2 chưa có phòng xếp theo tên
    return a.fullName.localeCompare(b.fullName, "vi");
  });
}

export type TenantRow = Awaited<ReturnType<typeof listTenants>>[number];
