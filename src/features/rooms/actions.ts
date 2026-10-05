"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertManager, requireContext } from "@/lib/session";
import { type RoomInput, roomSchema } from "./schemas";

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

  const [row] = await db
    .insert(rooms)
    .values({
      propertyId,
      name: v.name,
      floor: v.floor || null,
      area: v.area || null,
      rentPrice: v.rentPrice,
    })
    .returning({ id: rooms.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_room",
    resourceType: "room",
    resourceId: row.id,
    details: { name: v.name, rentPrice: v.rentPrice },
  });

  revalidatePath("/rooms");
  return success({ id: row.id });
}
