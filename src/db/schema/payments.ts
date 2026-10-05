import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { properties } from "./properties";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id),
  amount: integer("amount").notNull(),
  method: text("method", { enum: ["cash", "transfer"] }).notNull(),
  note: text("note"),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
