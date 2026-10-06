import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
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
        ownerName: "Nguyễn Văn Hùng",
        ownerBirthDate: "1980-05-15",
        ownerIdNumber: "001080009999",
        ownerIdDate: "2021-08-20",
        ownerIdPlace: "Cục CS QLHC về TTXH",
        ownerHometown: "Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
        ownerPhone: "0987654321",
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
  await db.delete(auditLogs).where(eq(auditLogs.propertyId, property.id));
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

  // 7. Chỉ số điện nước (Meter Readings) lịch sử 3 tháng gần nhất (07, 08, 09) và tháng hiện tại (10)
  // Phòng 101
  await db.insert(meterReadings).values([
    {
      propertyId: property.id,
      roomId: r101.id,
      period: "2026-07",
      electricPrev: 1040,
      electricCurr: 1090,
      waterPrev: 71,
      waterCurr: 74,
    },
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

  // Phòng 102
  await db.insert(meterReadings).values([
    {
      propertyId: property.id,
      roomId: r102.id,
      period: "2026-07",
      electricPrev: 680,
      electricCurr: 760,
      waterPrev: 37,
      waterCurr: 41,
    },
    {
      propertyId: property.id,
      roomId: r102.id,
      period: "2026-08",
      electricPrev: 760,
      electricCurr: 850,
      waterPrev: 41,
      waterCurr: 45,
    },
    {
      propertyId: property.id,
      roomId: r102.id,
      period: "2026-09",
      electricPrev: 850,
      electricCurr: 940,
      waterPrev: 45,
      waterCurr: 49,
    },
    {
      propertyId: property.id,
      roomId: r102.id,
      period: period,
      electricPrev: 940,
      electricCurr: 1030,
      waterPrev: 49,
      waterCurr: 53,
    },
  ]);

  // Phòng 201
  await db.insert(meterReadings).values([
    {
      propertyId: property.id,
      roomId: r201.id,
      period: "2026-07",
      electricPrev: 1280,
      electricCurr: 1400,
      waterPrev: 100,
      waterCurr: 105,
    },
    {
      propertyId: property.id,
      roomId: r201.id,
      period: "2026-08",
      electricPrev: 1400,
      electricCurr: 1520,
      waterPrev: 105,
      waterCurr: 110,
    },
    {
      propertyId: property.id,
      roomId: r201.id,
      period: "2026-09",
      electricPrev: 1520,
      electricCurr: 1640,
      waterPrev: 110,
      waterCurr: 115,
    },
    {
      propertyId: property.id,
      roomId: r201.id,
      period: period,
      electricPrev: 1640,
      electricCurr: 1760,
      waterPrev: 115,
      waterCurr: 120,
    },
  ]);

  // Phòng 202: 3 tháng trước có ghi, tháng này chưa ghi (để test CTA nhập số)
  await db.insert(meterReadings).values([
    {
      propertyId: property.id,
      roomId: r202.id,
      period: "2026-07",
      electricPrev: 290,
      electricCurr: 350,
      waterPrev: 22,
      waterCurr: 25,
    },
    {
      propertyId: property.id,
      roomId: r202.id,
      period: "2026-08",
      electricPrev: 350,
      electricCurr: 410,
      waterPrev: 25,
      waterCurr: 28,
    },
    {
      propertyId: property.id,
      roomId: r202.id,
      period: "2026-09",
      electricPrev: 410,
      electricCurr: 470,
      waterPrev: 28,
      waterCurr: 31,
    },
  ]);

  // 8. Hóa đơn (Invoices) & Thanh toán (Payments) lịch sử cho các phòng

  // --- Hóa đơn Phòng 101 ---
  // Tháng 7: Đã thu đủ (tiền mặt)
  const [inv101Jul] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r101.id,
      contractId: c101.id,
      period: "2026-07",
      dueDate: "2026-08-05",
      roomFee: 3000000,
      electricUsage: 50,
      electricUnitPrice: 3500,
      electricAmount: 175000,
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
    invoiceId: inv101Jul.id,
    amount: 3250000,
    method: "cash",
    paidAt: new Date("2026-08-02"),
  });

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
  // Tháng 7: Đã thu đủ (chuyển khoản)
  const [inv102Jul] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r102.id,
      contractId: c102.id,
      period: "2026-07",
      dueDate: "2026-08-05",
      roomFee: 3500000,
      electricUsage: 80,
      electricUnitPrice: 3500,
      electricAmount: 280000,
      waterUsage: 4,
      waterUnitPrice: 25000,
      waterAmount: 100000,
      otherFee: 0,
      total: 3880000,
      paidAmount: 3880000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv102Jul.id,
    amount: 3880000,
    method: "transfer",
    paidAt: new Date("2026-08-04"),
  });

  // Tháng 8: Đã thu đủ (chuyển khoản)
  const [inv102Aug] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r102.id,
      contractId: c102.id,
      period: "2026-08",
      dueDate: "2026-09-05",
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
    invoiceId: inv102Aug.id,
    amount: 3925000,
    method: "transfer",
    paidAt: new Date("2026-09-04"),
  });

  // Tháng 9: Đã thu đủ (chuyển khoản)
  const [inv102Sep] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r102.id,
      contractId: c102.id,
      period: "2026-09",
      dueDate: "2026-10-05",
      roomFee: 3500000,
      electricUsage: 90,
      electricUnitPrice: 3500,
      electricAmount: 315000,
      waterUsage: 4,
      waterUnitPrice: 25000,
      waterAmount: 100000,
      otherFee: 0,
      total: 3915000,
      paidAmount: 3915000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv102Sep.id,
    amount: 3915000,
    method: "transfer",
    paidAt: new Date("2026-10-03"),
  });

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
  // Tháng 7: Đã thu đủ (chuyển khoản)
  const [inv201Jul] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r201.id,
      contractId: c201.id,
      period: "2026-07",
      dueDate: "2026-08-05",
      roomFee: 4000000,
      electricUsage: 120,
      electricUnitPrice: 3500,
      electricAmount: 420000,
      waterUsage: 5,
      waterUnitPrice: 25000,
      waterAmount: 125000,
      otherFee: 0,
      total: 4545000,
      paidAmount: 4545000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv201Jul.id,
    amount: 4545000,
    method: "transfer",
    paidAt: new Date("2026-08-05"),
  });

  // Tháng 8: Đã thu đủ (chuyển khoản)
  const [inv201Aug] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r201.id,
      contractId: c201.id,
      period: "2026-08",
      dueDate: "2026-09-05",
      roomFee: 4000000,
      electricUsage: 120,
      electricUnitPrice: 3500,
      electricAmount: 420000,
      waterUsage: 5,
      waterUnitPrice: 25000,
      waterAmount: 125000,
      otherFee: 0,
      total: 4545000,
      paidAmount: 4545000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv201Aug.id,
    amount: 4545000,
    method: "transfer",
    paidAt: new Date("2026-09-05"),
  });

  // Tháng 9: Đã thu đủ (chuyển khoản)
  const [inv201Sep] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r201.id,
      contractId: c201.id,
      period: "2026-09",
      dueDate: "2026-10-05",
      roomFee: 4000000,
      electricUsage: 120,
      electricUnitPrice: 3500,
      electricAmount: 420000,
      waterUsage: 5,
      waterUnitPrice: 25000,
      waterAmount: 125000,
      otherFee: 0,
      total: 4545000,
      paidAmount: 4545000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv201Sep.id,
    amount: 4545000,
    method: "transfer",
    paidAt: new Date("2026-10-04"),
  });

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

  // --- Hóa đơn Phòng 202 ---
  // Tháng 7: Đã thu đủ (tiền mặt)
  const [inv202Jul] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r202.id,
      contractId: c202.id,
      period: "2026-07",
      dueDate: "2026-08-05",
      roomFee: 2800000,
      electricUsage: 60,
      electricUnitPrice: 3500,
      electricAmount: 210000,
      waterUsage: 3,
      waterUnitPrice: 25000,
      waterAmount: 75000,
      otherFee: 0,
      total: 3085000,
      paidAmount: 3085000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv202Jul.id,
    amount: 3085000,
    method: "cash",
    paidAt: new Date("2026-08-03"),
  });

  // Tháng 8: Đã thu đủ (tiền mặt)
  const [inv202Aug] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r202.id,
      contractId: c202.id,
      period: "2026-08",
      dueDate: "2026-09-05",
      roomFee: 2800000,
      electricUsage: 60,
      electricUnitPrice: 3500,
      electricAmount: 210000,
      waterUsage: 3,
      waterUnitPrice: 25000,
      waterAmount: 75000,
      otherFee: 0,
      total: 3085000,
      paidAmount: 3085000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv202Aug.id,
    amount: 3085000,
    method: "cash",
    paidAt: new Date("2026-09-02"),
  });

  // Tháng 9: Đã thu đủ (chuyển khoản)
  const [inv202Sep] = await db
    .insert(invoices)
    .values({
      propertyId: property.id,
      roomId: r202.id,
      contractId: c202.id,
      period: "2026-09",
      dueDate: "2026-10-05",
      roomFee: 2800000,
      electricUsage: 60,
      electricUnitPrice: 3500,
      electricAmount: 210000,
      waterUsage: 3,
      waterUnitPrice: 25000,
      waterAmount: 75000,
      otherFee: 0,
      total: 3085000,
      paidAmount: 3085000,
      status: "paid",
    })
    .returning();
  await db.insert(payments).values({
    propertyId: property.id,
    invoiceId: inv202Sep.id,
    amount: 3085000,
    method: "transfer",
    paidAt: new Date("2026-10-02"),
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
      completedAt: new Date("2026-10-02"),
    },
  ]);

  // 10. Nhật ký an ninh mẫu (Audit Logs)
  await db.insert(auditLogs).values([
    {
      propertyId: property.id,
      userId: owner.id,
      action: "login",
      resourceType: "auth",
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date("2026-10-05T08:00:00Z"),
    },
    {
      propertyId: property.id,
      userId: owner.id,
      action: "record_payment",
      resourceType: "payment",
      details: JSON.stringify({ room: "102", amount: 3925000, method: "transfer" }),
      ipAddress: "127.0.0.1",
      createdAt: new Date("2026-10-04T10:15:00Z"),
    },
    {
      propertyId: property.id,
      userId: owner.id,
      action: "create_invoice",
      resourceType: "invoice",
      details: JSON.stringify({ room: "101", period: "2026-10", total: 3397500 }),
      ipAddress: "127.0.0.1",
      createdAt: new Date("2026-10-01T09:30:00Z"),
    },
    {
      propertyId: property.id,
      userId: owner.id,
      action: "grant_tenant_account",
      resourceType: "tenant",
      details: JSON.stringify({ room: "101", tenant: "Nguyễn Văn A" }),
      ipAddress: "127.0.0.1",
      createdAt: new Date("2026-09-15T14:00:00Z"),
    },
    {
      propertyId: property.id,
      userId: owner.id,
      action: "update_settings",
      resourceType: "property",
      details: JSON.stringify({ electricPrice: 3500, waterPrice: 25000, dueDay: 5 }),
      ipAddress: "127.0.0.1",
      createdAt: new Date("2026-09-01T08:30:00Z"),
    },
  ]);

  console.log("=== Seed dữ liệu thành công! ===");
  console.log(`- Tài khoản: ${env.SEED_OWNER_EMAIL} / ${env.SEED_OWNER_PASSWORD}`);
  console.log(`- Nhà trọ: ${property.name} (${property.address})`);
  console.log(
    "- 6 Phòng: 101 (chưa thu), 102 (đã thu), 201 (quá hạn), 202 (chưa ghi số), 301 (trống), 302 (bảo trì)",
  );
  console.log(
    "- 6 Người thuê, 5 hợp đồng, 15 hóa đơn (kèm 12 hóa đơn lịch sử 3 tháng trước), 12 thanh toán, 3 yêu cầu bảo trì.",
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Lỗi khi seed:", e);
  process.exit(1);
});
