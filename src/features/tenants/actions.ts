"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { assertMember, requireContext } from "@/lib/session";
import { type TenantInput, tenantSchema } from "./schemas";

export async function createTenant(
  propertyId: string,
  input: TenantInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = tenantSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");

  const [row] = await db
    .insert(tenants)
    .values({
      propertyId,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      idNumber: parsed.data.idNumber || null,
    })
    .returning({ id: tenants.id });

  revalidatePath("/tenants");
  return success({ id: row.id });
}

export async function deleteTenant(propertyId: string, tenantId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  // Xóa mềm để hợp đồng và hóa đơn cũ vẫn tra được tên người thuê.
  await db
    .update(tenants)
    .set({ deletedAt: new Date() })
    .where(and(eq(tenants.propertyId, propertyId), eq(tenants.id, tenantId)));

  revalidatePath("/tenants");
  return success(undefined);
}
