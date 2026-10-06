"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contractServices, propertyServices } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { assertManager, requireContext } from "@/lib/session";
import {
  type SaveContractServicesInput,
  type ServiceInput,
  saveContractServicesSchema,
  serviceSchema,
} from "./schemas";

export async function createService(
  propertyId: string,
  input: ServiceInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [row] = await db
    .insert(propertyServices)
    .values({
      propertyId,
      name: v.name,
      chargeType: v.chargeType,
      unitPrice: v.unitPrice,
      description: v.description ?? null,
      isActive: v.isActive,
    })
    .returning({ id: propertyServices.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_service",
    resourceType: "service",
    resourceId: row.id,
    details: { name: v.name, unitPrice: v.unitPrice, chargeType: v.chargeType },
  });

  revalidatePath("/settings");
  revalidatePath("/services");
  return success({ id: row.id });
}

export async function updateService(
  propertyId: string,
  serviceId: string,
  input: ServiceInput,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  await db
    .update(propertyServices)
    .set({
      name: v.name,
      chargeType: v.chargeType,
      unitPrice: v.unitPrice,
      description: v.description ?? null,
      isActive: v.isActive,
    })
    .where(and(eq(propertyServices.propertyId, propertyId), eq(propertyServices.id, serviceId)));

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "update_service",
    resourceType: "service",
    resourceId: serviceId,
    details: { name: v.name, unitPrice: v.unitPrice, chargeType: v.chargeType },
  });

  revalidatePath("/settings");
  revalidatePath("/services");
  return success(undefined);
}

export async function deleteService(
  propertyId: string,
  serviceId: string,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  // Xóa liên kết trong contract_services trước (cascade), sau đó xóa service
  await db
    .delete(propertyServices)
    .where(and(eq(propertyServices.propertyId, propertyId), eq(propertyServices.id, serviceId)));

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "delete_service",
    resourceType: "service",
    resourceId: serviceId,
  });

  revalidatePath("/settings");
  revalidatePath("/services");
  return success(undefined);
}

export async function saveContractServices(
  propertyId: string,
  input: SaveContractServicesInput,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertManager(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = saveContractServicesSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  // Xóa dịch vụ cũ của hợp đồng
  await db
    .delete(contractServices)
    .where(
      and(
        eq(contractServices.propertyId, propertyId),
        eq(contractServices.contractId, v.contractId),
      ),
    );

  // Thêm lại các dịch vụ được chọn
  if (v.items.length > 0) {
    await db.insert(contractServices).values(
      v.items.map((item) => ({
        propertyId,
        contractId: v.contractId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        customPrice: item.customPrice ?? null,
      })),
    );
  }

  revalidatePath(`/contracts/${v.contractId}`);
  revalidatePath("/contracts");
  return success(undefined);
}
