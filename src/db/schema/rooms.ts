import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  floor: integer("floor"),
  area: integer("area"), // m²
  rentPrice: integer("rent_price").notNull(),
  roomType: text("room_type", { enum: ["standard", "dormitory", "sleepbox"] })
    .notNull()
    .default("standard"),
  status: text("status", { enum: ["vacant", "occupied", "maintenance"] })
    .notNull()
    .default("vacant"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roomBeds = pgTable("room_beds", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Giường 1", "Box 101-A"...
  rentPrice: integer("rent_price").notNull(),
  status: text("status", { enum: ["vacant", "occupied", "maintenance"] })
    .notNull()
    .default("vacant"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
