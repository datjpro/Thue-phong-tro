import { date, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { roomBeds, rooms } from "./rooms";
import { tenants } from "./tenants";

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  bedId: uuid("bed_id").references(() => roomBeds.id, { onDelete: "set null" }),
  contractNumber: text("contract_number"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null = chưa kết thúc
  rentPrice: integer("rent_price").notNull(),
  deposit: integer("deposit").notNull().default(0),
  depositStatus: text("deposit_status", { enum: ["paid", "returned", "deducted"] })
    .notNull()
    .default("paid"),
  billingCycle: integer("billing_cycle").notNull().default(1), // Số tháng mỗi chu kỳ thanh toán
  terms: text("terms"),
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
