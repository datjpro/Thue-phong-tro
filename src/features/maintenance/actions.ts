"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { maintenanceRequests, rooms } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertManager, assertMember, requireContext } from "@/lib/session";
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

  const rateCheck = checkRateLimit(`maintenance:${ctx.userId}`, { limit: 15, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = maintenanceSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  // Nếu là người thuê, chỉ được gửi yêu cầu cho chính phòng của mình
  if (ctx.role === "tenant" && v.roomId !== ctx.roomId) {
    return fail("forbidden");
  }

  const [room] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, v.roomId)))
    .limit(1);
  if (!room) return fail("notFound");

  const [created] = await db
    .insert(maintenanceRequests)
    .values({
      propertyId,
      roomId: v.roomId,
      title: v.title,
      description: v.description || null,
      category: v.category,
      priority: v.priority,
      isAnonymous: v.isAnonymous,
    })
    .returning({ id: maintenanceRequests.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_maintenance",
    resourceType: "maintenance",
    resourceId: created.id,
    details: { roomId: v.roomId, title: v.title, category: v.category, priority: v.priority },
  });

  revalidatePath("/maintenance");
  return success(undefined);
}

export async function updateMaintenanceStatus(
  propertyId: string,
  input: MaintenanceStatusInput,
): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`maintenance:${ctx.userId}`, { limit: 20, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = maintenanceStatusSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");

  await db
    .update(maintenanceRequests)
    .set({
      status: parsed.data.status,
      cost: parsed.data.cost ?? 0,
      response: parsed.data.response || null,
      completedAt: parsed.data.status === "done" ? new Date() : null,
    })
    .where(
      and(
        eq(maintenanceRequests.propertyId, propertyId),
        eq(maintenanceRequests.id, parsed.data.id),
      ),
    );

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "update_maintenance_status",
    resourceType: "maintenance",
    resourceId: parsed.data.id,
    details: { status: parsed.data.status, cost: parsed.data.cost },
  });

  revalidatePath("/maintenance");
  return success(undefined);
}

export async function deleteMaintenance(propertyId: string, id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  await db
    .delete(maintenanceRequests)
    .where(and(eq(maintenanceRequests.propertyId, propertyId), eq(maintenanceRequests.id, id)));

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "delete_maintenance",
    resourceType: "maintenance",
    resourceId: id,
  });

  revalidatePath("/maintenance");
  return success(undefined);
}
