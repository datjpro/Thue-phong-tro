"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account, propertyMembers, rooms, tenants, user } from "@/db/schema";
import { type ActionResult, fail, success } from "@/lib/action";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertMember, requireContext } from "@/lib/session";
import { type TenantInput, tenantSchema } from "./schemas";
import { formatTenantEmail, formatTenantUsername } from "./utils";

export async function createTenant(
  propertyId: string,
  input: TenantInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`tenant:${ctx.userId}`, { limit: 20, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  const parsed = tenantSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  const [row] = await db
    .insert(tenants)
    .values({
      propertyId,
      fullName: v.fullName,
      phone: v.phone || null,
      idNumber: v.idNumber || null,
      birthDate: v.birthDate || null,
      gender: v.gender || null,
      hometown: v.hometown || null,
      workplace: v.workplace || null,
      licensePlate: v.licensePlate || null,
      idCardFrontUrl: v.idCardFrontUrl || null,
      idCardBackUrl: v.idCardBackUrl || null,
      notes: v.notes || null,
    })
    .returning({ id: tenants.id });

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "create_tenant",
    resourceType: "tenant",
    resourceId: row.id,
    details: { fullName: v.fullName, idNumber: v.idNumber },
  });

  revalidatePath("/tenants");
  return success({ id: row.id });
}

export async function updateTenant(
  propertyId: string,
  tenantId: string,
  input: TenantInput,
): Promise<ActionResult<void>> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const parsed = tenantSchema.safeParse(input);
  if (!parsed.success) return fail("invalidInput");
  const v = parsed.data;

  await db
    .update(tenants)
    .set({
      fullName: v.fullName,
      phone: v.phone || null,
      idNumber: v.idNumber || null,
      birthDate: v.birthDate || null,
      gender: v.gender || null,
      hometown: v.hometown || null,
      workplace: v.workplace || null,
      licensePlate: v.licensePlate || null,
      idCardFrontUrl: v.idCardFrontUrl || null,
      idCardBackUrl: v.idCardBackUrl || null,
      notes: v.notes || null,
    })
    .where(and(eq(tenants.propertyId, propertyId), eq(tenants.id, tenantId)));

  revalidatePath("/tenants");
  return success(undefined);
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

export async function provisionTenantAccount(
  propertyId: string,
  tenantId: string,
  roomId: string,
): Promise<
  ActionResult<{
    username: string;
    email: string;
    passwordMasked: string;
    tenantName: string;
  }>
> {
  const ctx = await requireContext();
  if (!(await assertMember(ctx.userId, propertyId))) return fail("forbidden");

  const rateCheck = checkRateLimit(`provision:${ctx.userId}`, { limit: 10, windowMs: 60000 });
  if (!rateCheck.success) return fail("rateLimitExceeded");

  // 1. Kiểm tra người thuê và CCCD
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.propertyId, propertyId), eq(tenants.id, tenantId)))
    .limit(1);

  if (!tenant) return fail("notFound");
  if (!tenant.idNumber || tenant.idNumber.trim().length === 0) {
    return fail("missingIdNumber");
  }

  // 2. Kiểm tra phòng
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), eq(rooms.id, roomId)))
    .limit(1);

  if (!room) return fail("notFound");

  const username = formatTenantUsername(room.name);
  const email = formatTenantEmail(room.name);
  const password = tenant.idNumber.trim();

  // 3. Tìm hoặc tạo user trực tiếp mà KHÔNG ghi đè cookie phiên của chủ trọ
  let [accountUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  const hashedPassword = await hashPassword(password);

  if (!accountUser) {
    const newUserId = crypto.randomUUID();
    await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(user)
        .values({
          id: newUserId,
          name: tenant.fullName,
          email,
          emailVerified: true,
        })
        .returning();

      await tx.insert(account).values({
        id: crypto.randomUUID(),
        accountId: newUserId,
        providerId: "credential",
        userId: newUserId,
        password: hashedPassword,
      });

      accountUser = createdUser;
    });
  } else {
    // Nếu tài khoản đã tồn tại, đồng bộ mật khẩu CCCD mới và họ tên
    await db
      .update(account)
      .set({ password: hashedPassword })
      .where(eq(account.userId, accountUser.id));
    await db.update(user).set({ name: tenant.fullName }).where(eq(user.id, accountUser.id));
  }

  if (accountUser) {
    // Gán userId vào tenant
    await db.update(tenants).set({ userId: accountUser.id }).where(eq(tenants.id, tenant.id));

    // Đảm bảo quan hệ trong propertyMembers
    const [membership] = await db
      .select()
      .from(propertyMembers)
      .where(
        and(eq(propertyMembers.propertyId, propertyId), eq(propertyMembers.userId, accountUser.id)),
      )
      .limit(1);

    if (!membership) {
      await db.insert(propertyMembers).values({
        propertyId,
        userId: accountUser.id,
        role: "tenant",
      });
    }
  }

  await logAuditEvent({
    propertyId,
    userId: ctx.userId,
    action: "grant_tenant_account",
    resourceType: "tenant",
    resourceId: tenantId,
    details: { roomName: room.name, tenantName: tenant.fullName, email },
  });

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/tenants");

  return success({
    username,
    email,
    passwordMasked: password,
    tenantName: tenant.fullName,
  });
}
