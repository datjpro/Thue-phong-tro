import { date, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { rooms } from "./rooms";
import { tenants } from "./tenants";

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null = chưa kết thúc
  rentPrice: integer("rent_price").notNull(),
  deposit: integer("deposit").notNull().default(0),
  status: text("status", { enum: ["active", "ended"] })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const contractTenants = pgTable(
  "contract_tenants",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    isPrimary: text("is_primary", { enum: ["yes", "no"] })
      .notNull()
      .default("no"),
  },
  (t) => [primaryKey({ columns: [t.contractId, t.tenantId] })],
);
