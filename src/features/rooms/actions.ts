"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { assertMember, requireContext } from "@/lib/session";
import { type RoomInput, roomSchema } from "./schemas";

export async function createRoom(
  propertyId: string,
  input: RoomInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

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

  revalidatePath("/rooms");
  return success({ id: row.id });
}
