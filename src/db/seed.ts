import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  contractTenants,
  contracts,
  invoices,
  maintenanceRequests,
  meterReadings,
  payments,
  properties,
  propertyMembers,
  rooms,
  tenants,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { currentPeriod } from "@/lib/dates";
import { env } from "@/lib/env";

/** Seed đầy đủ dữ liệu mẫu để kiểm thử toàn bộ tính năng và luồng nghiệp vụ */
async function main() {
  console.log("--- Bắt đầu nạp dữ liệu mẫu (Seed Data) ---");

  // 1. Tạo tài khoản chủ trọ nếu chưa có
  let [owner] = await db.select().from(user).where(eq(user.email, env.SEED_OWNER_EMAIL)).limit(1);
  if (!owner) {
    await auth.api.signUpEmail({
      body: { email: env.SEED_OWNER_EMAIL, password: env.SEED_OWNER_PASSWORD, name: "Chủ trọ" },
    });
    [owner] = await db.select().from(user).where(eq(user.email, env.SEED_OWNER_EMAIL)).limit(1);
  }

  // 2. Tìm hoặc tạo Nhà trọ
  let [property] = await db.select().from(properties).limit(1);
  if (!property) {
    [property] = await db
      .insert(properties)
      .values({
        name: "Nhà trọ Xanh Cầu Giấy",
        address: "Số 12 ngõ 45 Cầu Giấy, Hà Nội",
        electricPrice: 3500,
        waterPrice: 25000,
        dueDay: 5,
      })
      .returning();
  }

  // Đảm bảo quan hệ quyền sở hữu
  const [member] = await db
    .select()
    .from(propertyMembers)
    .where(eq(propertyMembers.userId, owner.id))
    .limit(1);
  if (!member) {
    await db
      .insert(propertyMembers)
      .values({ propertyId: property.id, userId: owner.id, role: "owner" });
  }

  // 3. Làm sạch dữ liệu cũ để nạp lại dữ liệu chuẩn xác
  await db.delete(maintenanceRequests).where(eq(maintenanceRequests.propertyId, property.id));
  await db.delete(payments).where(eq(payments.propertyId, property.id));
  await db.delete(invoices).where(eq(invoices.propertyId, property.id));
  await db.delete(meterReadings).where(eq(meterReadings.propertyId, property.id));
  await db.delete(contractTenants).where(eq(contractTenants.propertyId, property.id));
  await db.delete(contracts).where(eq(contracts.propertyId, property.id));
  await db.delete(tenants).where(eq(tenants.propertyId, property.id));
  await db.delete(rooms).where(eq(rooms.propertyId, property.id));

  console.log("Đã làm sạch dữ liệu cũ.");

  // 4. Tạo danh sách 6 phòng với các tầng và trạng thái đa dạng
  const [r101] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 101",
      floor: 1,
      area: 25,
      rentPrice: 3000000,
      status: "occupied",
    })
    .returning();

  const [r102] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 102",
      floor: 1,
      area: 28,
      rentPrice: 3500000,
      status: "occupied",
    })
    .returning();

  const [r201] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 201",
      floor: 2,
      area: 32,
      rentPrice: 4000000,
      status: "occupied",
    })
    .returning();

  const [r202] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 202",
      floor: 2,
      area: 22,
      rentPrice: 2800000,
      status: "occupied",
    })
    .returning();

  const [r301] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 301",
      floor: 3,
      area: 20,
      rentPrice: 2500000,
      status: "vacant",
    })
    .returning();

  const [r302] = await db
    .insert(rooms)
    .values({
      propertyId: property.id,
      name: "Phòng 302",
      floor: 3,
      area: 26,
      rentPrice: 3200000,
      status: "maintenance",
    })
    .returning();

  // 5. Tạo danh bạ người thuê (Tenants)
  const [tNguyenA] = await db
    .insert(tenants)
    .values({
      propertyId: property.id,
      fullName: "Nguyễn Văn A",
      phone: "0912345678",
      idNumber: "001200001234",
    })
    .returning();

  const [tTranB] = await db
    .insert(tenants)
    .values({
      propertyId: property.id,
      fullName: "Trần Thị B",
      phone: "0987654321",
      idNumber: "001200005678",
    })
    .returning();

  const [tLeC] = await db
    .insert(tenants)
    .values({
      propertyId: property.id,
      fullName: "Lê Văn C",
      phone: "0901234567",
      idNumber: "001200009876",
    })
    .returning();

  const [tPhamD] = await db
    .insert(tenants)
    .values({
      propertyId: property.id,
      fullName: "Phạm Thị D",
      phone: "0934567890",
      idNumber: "001200004321",
    })
    .returning();

  const [tHoangE] = await db
    .insert(tenants)
    .values({
      propertyId: property.id,
      fullName: "Hoàng Văn E",
      phone: "0978123456",
      idNumber: "001200008765",
    })
    .returning();

  await db.insert(tenants).values({
    propertyId: property.id,
    fullName: "Vũ Thị F",
    phone: "0965432109",
    idNumber: "001200006543",
  });

  // 5b. Cấp tài khoản cho người thuê theo quy ước: Tên đăng nhập = Số phòng, Mật khẩu = CCCD
  const seedTenantAccounts = [
    { room: r101, tenant: tNguyenA, email: "phong101@tro.local" },
    { room: r102, tenant: tTranB, email: "phong102@tro.local" },
    { room: r201, tenant: tLeC, email: "phong201@tro.local" },
    { room: r202, tenant: tHoangE, email: "phong202@tro.local" },
  ];

  for (const item of seedTenantAccounts) {
    let [u] = await db.select().from(user).where(eq(user.email, item.email)).limit(1);
    if (!u) {
      await auth.api.signUpEmail({
        body: {
          email: item.email,
          password: item.tenant.idNumber ?? "12345678",
          name: item.tenant.fullName,
        },
      });
      [u] = await db.select().from(user).where(eq(user.email, item.email)).limit(1);
    }
    if (u) {
      await db.update(tenants).set({ userId: u.id }).where(eq(tenants.id, item.tenant.id));
      const [pm] = await db
        .select()
        .from(propertyMembers)
        .where(and(eq(propertyMembers.propertyId, property.id), eq(propertyMembers.userId, u.id)))
        .limit(1);
      if (!pm) {
        await db.insert(propertyMembers).values({
          propertyId: property.id,
          userId: u.id,
          role: "tenant",
        });
      }
    }
  }

  // 6. Tạo hợp đồng thuê (Contracts)
  // HĐ Phòng 101
  const [c101] = await db
    .insert(contracts)
    .values({
      propertyId: property.id,
      roomId: r101.id,
      startDate: "2026-01-01",
      endDate: "2027-06-30",
      rentPrice: 3000000,
      deposit: 3000000,
      status: "active",
    })
    .returning();
  await db.insert(contractTenants).values({
    propertyId: property.id,
    contractId: c101.id,
    tenantId: tNguyenA.id,
    isPrimary: "yes",
  });

  // HĐ Phòng 102
  const [c102] = await db
    .insert(contracts)
    .values({
      propertyId: property.id,
      roomId: r102.id,
      startDate: "2026-02-15",
      endDate: "2027-02-15",
      rentPrice: 3500000,
      deposit: 3500000,
      status: "active",
    })
    .returning();
  await db.insert(contractTenants).values({
    propertyId: property.id,
    contractId: c102.id,
    tenantId: tTranB.id,
    isPrimary: "yes",
  });

  // HĐ Phòng 201 (2 người cùng thuê: Lê Văn C đại diện, Phạm Thị D ở cùng)
  const [c201] = await db
    .insert(contracts)
    .values({
      propertyId: property.id,
      roomId: r201.id,
      startDate: "2026-03-01",
      endDate: "2027-02-28",
      rentPrice: 4000000,
      deposit: 4000000,
      status: "active",
    })
    .returning();
  await db.insert(contractTenants).values([
    {
      propertyId: property.id,
      contractId: c201.id,
      tenantId: tLeC.id,
      isPrimary: "yes",
    },
    {
      propertyId: property.id,
      contractId: c201.id,
      tenantId: tPhamD.id,
      isPrimary: "no",
    },
  ]);

  // HĐ Phòng 202
  const [c202] = await db
    .insert(contracts)
    .values({
      propertyId: property.id,
      roomId: r202.id,
      startDate: "2026-05-01",
      endDate: "2027-04-30",
      rentPrice: 2800000,
      deposit: 2800000,
      status: "active",
    })
    .returning();
  await db.insert(contractTenants).values({
    propertyId: property.id,
    contractId: c202.id,
    tenantId: tHoangE.id,
    isPrimary: "yes",
  });

  // HĐ cũ đã kết thúc ở phòng 301
  const [c301Old] = await db
    .insert(contracts)
    .values({
      propertyId: property.id,
      roomId: r301.id,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      rentPrice: 2500000,
      deposit: 2500000,
      status: "ended",
    })
    .returning();
  await db.insert(contractTenants).values({
    propertyId: property.id,
    contractId: c301Old.id,
    tenantId: tHoangE.id,
    isPrimary: "yes",
  });

  const period = currentPeriod();

  // 7. Chỉ số điện nước (Meter Readings)
  // Phòng 101: đã ghi tháng 10
  await db.insert(meterReadings).values([
    {
      propertyId: property.id,
      roomId: r101.id,
      period: "2026-08",
      electricPrev: 1090,
      electricCurr: 1135,
      waterPrev: 74,
      waterCurr: 77,
    },
    {
      propertyId: property.id,
      roomId: r101.id,
      period: "2026-09",
      electricPrev: 1135,
      electricCurr: 1200,
      waterPrev: 77,
      waterCurr: 80,
    },
    {
      propertyId: property.id,
      roomId: r101.id,
      period: period,
      electricPrev: 1200,
      electricCurr: 1285,
      waterPrev: 80,
      waterCurr: 84,
    },
  ]);

  // Phòng 102: đã ghi tháng 10
  await db.insert(meterReadings).values({
    propertyId: property.id,
    roomId: r102.id,
    period: period,
    electricPrev: 850,
    electricCurr: 940,
    waterPrev: 45,
    waterCurr: 49,
  });

  // Phòng 201: đã ghi tháng 10
  await db.insert(meterReadings).values({
    propertyId: property.id,
    roomId: r201.id,
    period: period,
    electricPrev: 1520,
    electricCurr: 1640,
    waterPrev: 110,
    waterCurr: 115,
  });

  // Phòng 202: kỳ trước có ghi, nhưng THÁNG NÀY CHƯA GHI (để test CTA nhập số)
  await db.insert(meterReadings).values({
    propertyId: property.id,
    roomId: r202.id,
    period: "2026-09",
    electricPrev: 410,
    electricCurr: 470,
    waterPrev: 28,
    waterCurr: 31,
  });

  // 8. Hóa đơn (Invoices) & Thanh toán (Payments)

  // --- Hóa đơn Phòng 101 ---
  // Tháng 8: Đã thu đủ (tiền mặt)
  const [inv101Aug] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r101.id,
      contractId: c101.id,
      period: "2026-08",
      dueDate: "2026-09-05",
      roomFee: 3000000,
      electricUsage: 45,
      electricUnitPrice: 3500,
      electricAmount: 157500,
      waterUsage: 3,
      waterUnitPrice: 25000,
      waterAmount: 75000,
      otherFee: 0,
      total: 3180000,
      paidAmount: 3180000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv101Aug.id,
    amount: 3180000,
    method: "cash",
    paidAt: new Date("2026-09-03"),
  });

  // Tháng 9: Đã thu đủ (chuyển khoản)
  const [inv101Sep] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r101.id,
      contractId: c101.id,
      period: "2026-09",
      dueDate: "2026-10-05",
      roomFee: 3000000,
      electricUsage: 65,
      electricUnitPrice: 3500,
      electricAmount: 227500,
      waterUsage: 3,
      waterUnitPrice: 25000,
      waterAmount: 75000,
      otherFee: 0,
      total: 3250000,
      paidAmount: 3250000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv101Sep.id,
    amount: 3250000,
    method: "transfer",
    paidAt: new Date("2026-10-02"),
  });

  // Tháng 10: CHƯA THU (Hạn 05/11)
  await db.insert(invoices).values({
    propertyId: property.id,
    roomId: r101.id,
    contractId: c101.id,
    period: period,
    dueDate: "2026-11-05",
    roomFee: 3000000,
    electricUsage: 85,
    electricUnitPrice: 3500,
    electricAmount: 297500,
    waterUsage: 4,
    waterUnitPrice: 25000,
    waterAmount: 100000,
    otherFee: 0,
    total: 3397500,
    paidAmount: 0,
    status: "unpaid",
  });

  // --- Hóa đơn Phòng 102 ---
  // Tháng 10: ĐÃ THU ĐỦ (chuyển khoản)
  const [inv102Oct] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r102.id,
      contractId: c102.id,
      period: period,
      dueDate: "2026-11-05",
      roomFee: 3500000,
      electricUsage: 90,
      electricUnitPrice: 3500,
      electricAmount: 315000,
      waterUsage: 4,
      waterUnitPrice: 25000,
      waterAmount: 100000,
      otherFee: 10000,
      otherFeeNote: "Vệ sinh hành lang",
      total: 3925000,
      paidAmount: 3925000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv102Oct.id,
    amount: 3925000,
    method: "transfer",
    paidAt: new Date("2026-10-04"),
  });

  // --- Hóa đơn Phòng 201 ---
  // Tháng 10: QUÁ HẠN (đặt dueDate trước ngày hôm nay để test bộ lọc Quá hạn)
  await db.insert(invoices).values({
    propertyId: property.id,
    roomId: r201.id,
    contractId: c201.id,
    period: period,
    dueDate: "2026-10-04",
    roomFee: 4000000,
    electricUsage: 120,
    electricUnitPrice: 3500,
    electricAmount: 420000,
    waterUsage: 5,
    waterUnitPrice: 25000,
    waterAmount: 125000,
    otherFee: 0,
    total: 4545000,
    paidAmount: 0,
    status: "unpaid",
  });

  // 9. Yêu cầu sửa chữa / Báo hỏng (Maintenance Requests)
  await db.insert(maintenanceRequests).values([
    {
      propertyId: property.id,
      roomId: r302.id,
      title: "Máy lạnh rò rỉ nước",
      description: "Nước nhỏ giọt từ máng dàn lạnh xuống sàn gỗ, cần thợ kiểm tra ống thoát nước.",
      status: "in_progress",
    },
    {
      propertyId: property.id,
      roomId: r201.id,
      title: "Vòi sen tắm bị yếu nước",
      description: "Nước chảy yếu vào khung giờ cao điểm từ 19h-21h.",
      status: "open",
    },
    {
      propertyId: property.id,
      roomId: r101.id,
      title: "Thay bóng đèn ban công",
      description: "Đèn ban công bị cháy sau trận mưa lớn.",
      status: "done",
      resolvedAt: new Date("2026-10-02"),
    },
  ]);

  console.log("=== Seed dữ liệu thành công! ===");
  console.log(`- Tài khoản: ${env.SEED_OWNER_EMAIL} / ${env.SEED_OWNER_PASSWORD}`);
  console.log(`- Nhà trọ: ${property.name} (${property.address})`);
  console.log(
    "- 6 Phòng: 101 (chưa thu), 102 (đã thu), 201 (quá hạn), 202 (chưa ghi số), 301 (trống), 302 (bảo trì)",
  );
  console.log("- 6 Người thuê, 5 hợp đồng, 4 hóa đơn, 3 thanh toán, 3 yêu cầu bảo trì.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Lỗi khi seed:", e);
  process.exit(1);
});
