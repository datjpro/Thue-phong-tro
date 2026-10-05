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
      status: maintenanceRequests.status,
      createdAt: maintenanceRequests.createdAt,
      roomName: rooms.name,
    })
    .from(maintenanceRequests)
    .innerJoin(rooms, eq(rooms.id, maintenanceRequests.roomId))
    .where(eq(maintenanceRequests.propertyId, propertyId))
    .orderBy(desc(maintenanceRequests.createdAt));
}
