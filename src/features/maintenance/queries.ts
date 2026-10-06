import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { maintenanceRequests, rooms } from "@/db/schema";

export async function listMaintenance(propertyId: string) {
  return db
    .select({
      id: maintenanceRequests.id,
      roomId: maintenanceRequests.roomId,
      title: maintenanceRequests.title,
      description: maintenanceRequests.description,
      category: maintenanceRequests.category,
      priority: maintenanceRequests.priority,
      cost: maintenanceRequests.cost,
      status: maintenanceRequests.status,
      response: maintenanceRequests.response,
      isAnonymous: maintenanceRequests.isAnonymous,
      createdAt: maintenanceRequests.createdAt,
      completedAt: maintenanceRequests.completedAt,
      roomName: rooms.name,
    })
    .from(maintenanceRequests)
    .innerJoin(rooms, eq(rooms.id, maintenanceRequests.roomId))
    .where(eq(maintenanceRequests.propertyId, propertyId))
    .orderBy(desc(maintenanceRequests.createdAt));
}
export type MaintenanceItem = Awaited<ReturnType<typeof listMaintenance>>[number];
