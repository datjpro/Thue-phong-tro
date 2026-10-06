import { date, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { properties } from "./properties";
import { rooms } from "./rooms";

export const roomAssets = pgTable("room_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Quạt, Máy lạnh, Tủ lạnh, Giường, Khóa thông minh...
  category: text("category", { enum: ["electrical", "furniture", "sanitary", "security", "other"] })
    .notNull()
    .default("furniture"),
  quantity: integer("quantity").notNull().default(1),
  condition: text("condition", { enum: ["new", "good", "fair", "damaged"] })
    .notNull()
    .default("good"),
  serialNumber: text("serial_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assetHandovers = pgTable("asset_handovers", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["checkin", "checkout"] })
    .notNull()
    .default("checkin"),
  handoverDate: date("handover_date").notNull(),
  items: jsonb("items")
    .$type<Array<{ assetName: string; condition: string; quantity: number; notes?: string }>>()
    .notNull()
    .default([]),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  notes: text("notes"),
  signedByTenant: text("signed_by_tenant", { enum: ["yes", "no"] })
    .notNull()
    .default("no"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
