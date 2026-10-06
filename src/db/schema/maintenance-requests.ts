import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { rooms } from "./rooms";

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", {
    enum: ["facility", "noise", "cleanliness", "security", "other"],
  })
    .notNull()
    .default("facility"),
  priority: text("priority", { enum: ["low", "normal", "urgent"] })
    .notNull()
    .default("normal"),
  cost: integer("cost").notNull().default(0), // Chi phí sửa chữa/bảo trì (VND)
  status: text("status", { enum: ["open", "in_progress", "done", "rejected"] })
    .notNull()
    .default("open"),
  response: text("response"), // Nội dung phản hồi / cách xử lý của chủ trọ
  isAnonymous: text("is_anonymous", { enum: ["yes", "no"] })
    .notNull()
    .default("no"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
