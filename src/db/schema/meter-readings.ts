import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { rooms } from "./rooms";

export const meterReadings = pgTable(
  "meter_readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    period: text("period").notNull(), // "YYYY-MM"
    electricPrev: integer("electric_prev").notNull(),
    electricCurr: integer("electric_curr").notNull(),
    waterPrev: integer("water_prev").notNull(),
    waterCurr: integer("water_curr").notNull(),
    electricPhoto: text("electric_photo"), // Base64 hoặc URL ảnh công tơ điện
    waterPhoto: text("water_photo"), // Base64 hoặc URL ảnh công tơ nước
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.roomId, t.period)],
);
