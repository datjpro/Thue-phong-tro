import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { propertyMembers } from "@/db/schema";
import { auth } from "@/lib/auth";

export type AppContext = { userId: string; userName: string; propertyId: string };

/** Lấy người dùng đang đăng nhập và nhà trọ làm việc; chưa đăng nhập thì chuyển về /login. */
export async function requireContext(): Promise<AppContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [membership] = await db
    .select({ propertyId: propertyMembers.propertyId })
    .from(propertyMembers)
    .where(eq(propertyMembers.userId, session.user.id))
    .limit(1);
  if (!membership) redirect("/login");

  return {
    userId: session.user.id,
    userName: session.user.name,
    propertyId: membership.propertyId,
  };
}

/** Dùng trong Server Action: kiểm tra quyền trên đúng propertyId được gửi lên. */
export async function assertMember(userId: string, propertyId: string): Promise<boolean> {
  const [row] = await db
    .select({ propertyId: propertyMembers.propertyId })
    .from(propertyMembers)
    .where(and(eq(propertyMembers.userId, userId), eq(propertyMembers.propertyId, propertyId)))
    .limit(1);
  return Boolean(row);
}
