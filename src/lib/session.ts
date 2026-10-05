import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contracts, contractTenants, propertyMembers, rooms, tenants } from "@/db/schema";
import { auth } from "@/lib/auth";

export type UserRole = "owner" | "manager" | "tenant";

export type AppContext = {
  userId: string;
  userName: string;
  propertyId: string;
  role: UserRole;
  tenantId: string | null;
  roomId: string | null;
  roomName: string | null;
};

/** Lấy người dùng đang đăng nhập và nhà trọ làm việc; chưa đăng nhập thì chuyển về /login. */
export async function requireContext(): Promise<AppContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [membership] = await db
    .select({ propertyId: propertyMembers.propertyId, role: propertyMembers.role })
    .from(propertyMembers)
    .where(eq(propertyMembers.userId, session.user.id))
    .limit(1);
  if (!membership) redirect("/login");

  const role = (membership.role as UserRole) || "owner";
  let tenantId: string | null = null;
  let roomId: string | null = null;
  let roomName: string | null = null;

  if (role === "tenant") {
    // Tìm hồ sơ tenant và phòng đang thuê
    const [t] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        and(
          eq(tenants.propertyId, membership.propertyId),
          eq(tenants.userId, session.user.id),
          isNull(tenants.deletedAt),
        ),
      )
      .limit(1);

    if (t) {
      tenantId = t.id;
      const [active] = await db
        .select({ roomId: contracts.roomId, roomName: rooms.name })
        .from(contractTenants)
        .innerJoin(contracts, eq(contracts.id, contractTenants.contractId))
        .innerJoin(rooms, eq(rooms.id, contracts.roomId))
        .where(
          and(
            eq(contractTenants.propertyId, membership.propertyId),
            eq(contractTenants.tenantId, t.id),
            eq(contracts.status, "active"),
            isNull(contracts.deletedAt),
          ),
        )
        .limit(1);

      if (active) {
        roomId = active.roomId;
        roomName = active.roomName;
      }
    }
  }

  return {
    userId: session.user.id,
    userName: session.user.name,
    propertyId: membership.propertyId,
    role,
    tenantId,
    roomId,
    roomName,
  };
}

/** Dùng trong Server Action: kiểm tra quyền thành viên (owner/manager/tenant) */
export async function assertMember(userId: string, propertyId: string): Promise<boolean> {
  const [row] = await db
    .select({ propertyId: propertyMembers.propertyId })
    .from(propertyMembers)
    .where(and(eq(propertyMembers.userId, userId), eq(propertyMembers.propertyId, propertyId)))
    .limit(1);
  return Boolean(row);
}

/** Dùng trong Server Action: chỉ cho phép Chủ trọ / Quản lý (không cho khách thuê thao tác) */
export async function assertManager(userId: string, propertyId: string): Promise<boolean> {
  const [row] = await db
    .select({ role: propertyMembers.role })
    .from(propertyMembers)
    .where(and(eq(propertyMembers.userId, userId), eq(propertyMembers.propertyId, propertyId)))
    .limit(1);
  return row?.role === "owner" || row?.role === "manager";
}
