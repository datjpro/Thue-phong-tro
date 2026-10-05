"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contracts, contractTenants, meterReadings, rooms, tenants } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { prevPeriod } from "@/lib/dates";
import { assertMember, requireContext } from "@/lib/session";
import {
  type ContractInput,
  contractSchema,
  type EndContractInput,
  endContractSchema,
} from "./schemas";

export async function createContract(
  propertyId: string,
  input: ContractInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [room] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, v.roomId)))
    .limit(1);
  if (!room) return fail("notFound");

  const [existing] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.roomId, v.roomId),
        eq(contracts.status, "active"),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);
  if (existing) return fail("roomHasActiveContract");

  // Người thuê phải thuộc cùng nhà trọ.
  const validTenants = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.propertyId, propertyId), isNull(tenants.deletedAt)));
  const validIds = new Set(validTenants.map((t) => t.id));
  if (!v.tenantIds.every((id) => validIds.has(id))) return fail("notFound");

  const [hasReading] = await db
    .select({ id: meterReadings.id })
    .from(meterReadings)
    .where(and(eq(meterReadings.propertyId, propertyId), eq(meterReadings.roomId, v.roomId)))
    .limit(1);

  const id = await db.transaction(async (tx) => {
    const [c] = await tx
      .insert(contracts)
      .values({
        propertyId,
        roomId: v.roomId,
        startDate: v.startDate,
        rentPrice: v.rentPrice,
        deposit: v.deposit,
      })
      .returning({ id: contracts.id });

    await tx.insert(contractTenants).values(
      v.tenantIds.map((tenantId, i) => ({
        propertyId,
        contractId: c.id,
        tenantId,
        isPrimary: (i === 0 ? "yes" : "no") as "yes" | "no",
      })),
    );

    // Mốc chỉ số ở kỳ liền trước tháng bắt đầu để hóa đơn đầu tiên có chỉ số cũ.
    if (!hasReading) {
      await tx.insert(meterReadings).values({
        propertyId,
        roomId: v.roomId,
        period: prevPeriod(v.startDate.slice(0, 7)),
        electricPrev: v.initialElectric,
        electricCurr: v.initialElectric,
        waterPrev: v.initialWater,
        waterCurr: v.initialWater,
      });
    }

    await tx.update(rooms).set({ status: "occupied" }).where(eq(rooms.id, v.roomId));
    return c.id;
  });

  revalidatePath("/", "layout");
  return success({ id });
}

export async function endContract(
  propertyId: string,
  input: EndContractInput,
): Promise<ActionResult> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = endContractSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");

  const [c] = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.propertyId, propertyId),
        eq(contracts.id, parsed.data.contractId),
        eq(contracts.status, "active"),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);
  if (!c) return fail("notFound");
  if (parsed.data.endDate < c.startDate) return fail("endBeforeStart");

  await db.transaction(async (tx) => {
    await tx
      .update(contracts)
      .set({ status: "ended", endDate: parsed.data.endDate })
      .where(eq(contracts.id, c.id));
    await tx.update(rooms).set({ status: "vacant" }).where(eq(rooms.id, c.roomId));
  });

  revalidatePath("/", "layout");
  return success(undefined);
}
