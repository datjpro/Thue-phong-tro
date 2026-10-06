import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { properties } from "./properties";

export const propertyServices = pgTable("property_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Phí rác, Wi-Fi / Internet, Giữ xe máy, Máy giặt chung, Vệ sinh...
  chargeType: text("charge_type", {
    enum: ["fixed_room", "per_person", "per_vehicle", "per_usage"],
  })
    .notNull()
    .default("fixed_room"),
  unitPrice: integer("unit_price").notNull(),
  description: text("description"),
  isActive: text("is_active", { enum: ["yes", "no"] })
    .notNull()
    .default("yes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contractServices = pgTable("contract_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => propertyServices.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  customPrice: integer("custom_price"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
