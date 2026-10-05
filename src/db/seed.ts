import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { propertyMembers, properties, rooms, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

/** Seed idempotent: 1 chủ trọ + 1 nhà trọ + 1 phòng mẫu. Chạy lại không tạo trùng. */
async function main() {
  let [owner] = await db.select().from(user).where(eq(user.email, env.SEED_OWNER_EMAIL)).limit(1);
  if (!owner) {
    await auth.api.signUpEmail({
      body: { email: env.SEED_OWNER_EMAIL, password: env.SEED_OWNER_PASSWORD, name: "Chủ trọ" },
    });
    [owner] = await db.select().from(user).where(eq(user.email, env.SEED_OWNER_EMAIL)).limit(1);
  }

  const [member] = await db
    .select()
    .from(propertyMembers)
    .where(eq(propertyMembers.userId, owner.id))
    .limit(1);
  if (member) {
    console.log("Seed đã có, bỏ qua.");
    process.exit(0);
  }

  const [property] = await db
    .insert(properties)
    .values({
      name: "Nhà trọ mẫu",
      address: "Hà Nội",
      electricPrice: 3500,
      waterPrice: 25000,
      dueDay: 5,
    })
    .returning();
  await db
    .insert(propertyMembers)
    .values({ propertyId: property.id, userId: owner.id, role: "owner" });
  await db.insert(rooms).values({
    propertyId: property.id,
    name: "Phòng 101",
    floor: 1,
    area: 25,
    rentPrice: 3_000_000,
  });

  console.log(`Đã tạo: ${env.SEED_OWNER_EMAIL} / ${env.SEED_OWNER_PASSWORD}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
