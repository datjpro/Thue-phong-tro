import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { properties } from "./properties";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  idNumber: text("id_number"), // CCCD/CMND 12 số
  birthDate: date("birth_date"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  hometown: text("hometown"), // Quê quán / Nơi ĐK thường trú
  workplace: text("workplace"), // Công ty / Trường học
  licensePlate: text("license_plate"), // Biển số xe
  idCardFrontUrl: text("id_card_front_url"),
  idCardBackUrl: text("id_card_back_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
