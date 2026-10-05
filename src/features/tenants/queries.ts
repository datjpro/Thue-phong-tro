import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export async function listTenants(propertyId: string) {
  return db
    .select()
    .from(tenants)
    .where(and(eq(tenants.propertyId, propertyId), isNull(tenants.deletedAt)))
    .orderBy(tenants.fullName);
}
