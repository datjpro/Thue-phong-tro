"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { assertMember, requireContext } from "@/lib/session";
import { type PropertySettingsInput, propertySettingsSchema } from "./schemas";

export async function updateProperty(
  propertyId: string,
  input: PropertySettingsInput,
): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = propertySettingsSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");

  // Chỉ đổi giá mặc định cho kỳ sau; hóa đơn cũ đã snapshot nên không bị ảnh hưởng.
  await db.update(properties).set(parsed.data).where(eq(properties.id, propertyId));
  revalidatePath("/", "layout");
  return success(undefined);
}
