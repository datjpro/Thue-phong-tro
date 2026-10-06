import { integer, pgTable, primaryKey, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Giá điện/nước/ngày hạn đặt ở cấp nhà trọ làm mặc định; hóa đơn sẽ snapshot lại.
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  electricPrice: integer("electric_price").notNull().default(3500),
  electricPricingType: text("electric_pricing_type", { enum: ["fixed", "tiered"] })
    .notNull()
    .default("fixed"),
  waterPrice: integer("water_price").notNull().default(25000),
  waterPricingType: text("water_pricing_type", { enum: ["meter", "per_person"] })
    .notNull()
    .default("meter"),
  waterPricePerPerson: integer("water_price_per_person").notNull().default(100000),
  dueDay: smallint("due_day").notNull().default(5),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankOwner: text("bank_owner"),
  // Thông tin chủ trọ (Đại diện Bên A trong hợp đồng)
  ownerName: text("owner_name"),
  ownerBirthDate: text("owner_birth_date"),
  ownerIdNumber: text("owner_id_number"),
  ownerIdDate: text("owner_id_date"),
  ownerIdPlace: text("owner_id_place"),
  ownerHometown: text("owner_hometown"),
  ownerPhone: text("owner_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propertyMembers = pgTable(
  "property_members",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "manager", "tenant"] })
      .notNull()
      .default("owner"),
  },
  (t) => [primaryKey({ columns: [t.propertyId, t.userId] })],
);
