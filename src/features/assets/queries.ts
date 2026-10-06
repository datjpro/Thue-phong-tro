import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assetHandovers, roomAssets } from "@/db/schema";

export async function listRoomAssets(propertyId: string, roomId: string) {
  const rows = await db
    .select()
    .from(roomAssets)
    .where(and(eq(roomAssets.propertyId, propertyId), eq(roomAssets.roomId, roomId)))
    .orderBy(roomAssets.category, roomAssets.name);
  return rows;
}

export async function listAssetHandovers(propertyId: string, roomId: string) {
  const rows = await db
    .select()
    .from(assetHandovers)
    .where(and(eq(assetHandovers.propertyId, propertyId), eq(assetHandovers.roomId, roomId)))
    .orderBy(desc(assetHandovers.handoverDate));
  return rows;
}

export type RoomAssetRow = Awaited<ReturnType<typeof listRoomAssets>>[number];
export type AssetHandoverRow = Awaited<ReturnType<typeof listAssetHandovers>>[number];
