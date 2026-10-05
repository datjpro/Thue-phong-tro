import { integer, pgTable, primaryKey, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Giá điện/nước/ngày hạn đặt ở cấp nhà trọ làm mặc định; hóa đơn sẽ snapshot lại.
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  electricPrice: integer("electric_price").notNull().default(3500),
  waterPrice: integer("water_price").notNull().default(25000),
  dueDay: smallint("due_day").notNull().default(5),
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
