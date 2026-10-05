"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { maintenanceRequests, rooms } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { assertMember, requireContext } from "@/lib/session";
import {
  type MaintenanceInput,
  type MaintenanceStatusInput,
  maintenanceSchema,
  maintenanceStatusSchema,
} from "./schemas";

export async function createMaintenance(
  propertyId: string,
  input: MaintenanceInput,
): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = maintenanceSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [room] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, v.roomId)))
    .limit(1);
  if (!room) return fail("notFound");

  await db.insert(maintenanceRequests).values({
    propertyId,
    roomId: v.roomId,
    title: v.title,
    description: v.description || null,
  });
  revalidatePath("/maintenance");
  return success(undefined);
}

export async function updateMaintenanceStatus(
  propertyId: string,
  input: MaintenanceStatusInput,
): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = maintenanceStatusSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");

  await db
    .update(maintenanceRequests)
    .set({
      status: parsed.data.status,
      resolvedAt: parsed.data.status === "done" ? new Date() : null,
    })
    .where(
      and(
        eq(maintenanceRequests.propertyId, propertyId),
        eq(maintenanceRequests.id, parsed.data.id),
      ),
    );
  revalidatePath("/maintenance");
  return success(undefined);
}
