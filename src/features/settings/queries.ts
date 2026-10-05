import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, user } from "@/db/schema";

export async function listAuditLogs(propertyId: string, limit = 20) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId: auditLogs.resourceId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
      userName: user.name,
    })
    .from(auditLogs)
    .leftJoin(user, eq(user.id, auditLogs.userId))
    .where(eq(auditLogs.propertyId, propertyId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
