"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roomAssets, roomBeds, rooms } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertManager, requireContext } from "@/lib/session";
import { type RoomBedInput, type RoomInput, roomBedSchema, roomSchema } from "./schemas";

export async function createRoom(
  propertyId: string,
  input: RoomInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`room:${ctx.userId}`, { limit: 20, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  // Kiểm tra trùng tên phòng trong cùng nhà trọ
  const [existing] = await db
    .select({ id: rooms.id, name: rooms.name })
    .from(rooms)
    .where(
      and(
        eq(rooms.propertyId, propertyId),
        sql`lower(trim(${rooms.name})) = lower(trim(${v.name}))`,
      ),
    )
    .limit(1);

  if (existing) {
    return fail("duplicateRoomName");
  }

  const [row] = await db
    .insert(rooms)
    .values({
      propertyId,
      name: v.name,
      floor: v.floor ?? null,
      area: v.area ?? null,
      rentPrice: v.rentPrice,
      roomType: v.roomType,
    })
    .returning({ id: rooms.id });

  // Tự động lưu danh sách trang thiết bị / nội thất đã tích chọn vào bảng room_assets
  if (v.selectedAssets && v.selectedAssets.length > 0) {
    const assetValues = v.selectedAssets.map((a) => ({
      propertyId,
      roomId: row.id,
      name: a.name,
      category: a.category,
      quantity: a.quantity > 0 ? a.quantity : 1,
      condition: "good" as const,
    }));
    await db.insert(roomAssets).values(assetValues);
  }

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_room",
    resourceType: "room",
    resourceId: row.id,
    details: { name: v.name, rentPrice: v.rentPrice, roomType: v.roomType },
  });

  revalidatePath("/");
  revalidatePath("/rooms");
  return success({ id: row.id });
}

export async function addRoomBed(
  propertyId: string,
  input: RoomBedInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = roomBedSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [bed] = await db
    .insert(roomBeds)
    .values({
      propertyId,
      roomId: v.roomId,
      name: v.name,
      rentPrice: v.rentPrice,
      status: "vacant",
    })
    .returning({ id: roomBeds.id });

  revalidatePath(`/rooms/${v.roomId}`);
  return success({ id: bed.id });
}

export async function deleteRoomBed(
  propertyId: string,
  bedId: string,
  roomId: string,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  await db.delete(roomBeds).where(and(eq(roomBeds.propertyId, propertyId), eq(roomBeds.id, bedId)));

  revalidatePath(`/rooms/${roomId}`);
  return success(undefined);
}
