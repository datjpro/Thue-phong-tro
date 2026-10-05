import { date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { properties } from "./properties";
import { rooms } from "./rooms";

// Các cột tiền/đơn giá là snapshot tại lúc tạo hóa đơn: đổi giá sau này không ảnh hưởng.
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id),
  period: text("period").notNull(), // "YYYY-MM"
  roomFee: integer("room_fee").notNull(),
  electricUsage: integer("electric_usage").notNull(),
  electricUnitPrice: integer("electric_unit_price").notNull(),
  electricAmount: integer("electric_amount").notNull(),
  waterUsage: integer("water_usage").notNull(),
  waterUnitPrice: integer("water_unit_price").notNull(),
  waterAmount: integer("water_amount").notNull(),
  otherFee: integer("other_fee").notNull().default(0),
  otherFeeNote: text("other_fee_note"),
  total: integer("total").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  status: text("status", { enum: ["unpaid", "partial", "paid"] })
    .notNull()
    .default("unpaid"),
  dueDate: date("due_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
