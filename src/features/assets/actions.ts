"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { assetHandovers, roomAssets } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertManager, requireContext } from "@/lib/session";
import { type AssetInput, assetSchema, type HandoverInput, handoverSchema } from "./schemas";

export async function createRoomAsset(
  propertyId: string,
  input: AssetInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`asset:${ctx.userId}`, { limit: 30, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [row] = await db
    .insert(roomAssets)
    .values({
      propertyId,
      roomId: v.roomId,
      name: v.name,
      category: v.category,
      quantity: v.quantity,
      condition: v.condition,
      serialNumber: v.serialNumber || null,
      notes: v.notes || null,
    })
    .returning({ id: roomAssets.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_room_asset",
    resourceType: "asset",
    resourceId: row.id,
    details: { name: v.name, roomId: v.roomId },
  });

  revalidatePath(`/rooms/${v.roomId}`);
  return success({ id: row.id });
}

export async function deleteRoomAsset(
  propertyId: string,
  assetId: string,
  roomId: string,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  await db
    .delete(roomAssets)
    .where(and(eq(roomAssets.propertyId, propertyId), eq(roomAssets.id, assetId)));

  revalidatePath(`/rooms/${roomId}`);
  return success(undefined);
}

export async function saveAssetHandover(
  propertyId: string,
  input: HandoverInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = handoverSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [row] = await db
    .insert(assetHandovers)
    .values({
      propertyId,
      contractId: v.contractId,
      roomId: v.roomId,
      type: v.type,
      handoverDate: v.handoverDate,
      items: v.items,
      photos: v.photos,
      notes: v.notes || null,
      signedByTenant: v.signedByTenant,
    })
    .returning({ id: assetHandovers.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "save_asset_handover",
    resourceType: "asset_handover",
    resourceId: row.id,
    details: { type: v.type, roomId: v.roomId, contractId: v.contractId },
  });

  revalidatePath(`/rooms/${v.roomId}`);
  return success({ id: row.id });
}
