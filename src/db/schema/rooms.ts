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
  status: text("status", { enum: ["vacant", "occupied", "maintenance"] })
    .notNull()
    .default("vacant"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
