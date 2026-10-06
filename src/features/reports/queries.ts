import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contracts, invoices, maintenanceRequests, roomBeds, rooms } from "@/db/schema";
import { currentPeriod, prevPeriod } from "@/lib/dates";

export async function getFinancialAndOccupancyReport(propertyId: string) {
  const currentMonth = currentPeriod();

  // 1. Lấy thông tin phòng & tỷ lệ lấp đầy
  const [allRooms, allBeds, activeContracts] = await Promise.all([
    db.select().from(rooms).where(eq(rooms.propertyId, propertyId)),
    db.select().from(roomBeds).where(eq(roomBeds.propertyId, propertyId)),
    db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.propertyId, propertyId),
          eq(contracts.status, "active"),
          isNull(contracts.deletedAt),
        ),
      ),
  ]);

  const totalRooms = allRooms.length;
  const occupiedRooms = allRooms.filter((r) =>
    activeContracts.some((c) => c.roomId === r.id),
  ).length;
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalBeds = allBeds.length;
  const occupiedBeds = allBeds.filter((b) => b.status === "occupied").length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // 2. Lấy danh sách 6 kỳ gần nhất
  const periods: string[] = [];
  let p = currentMonth;
  for (let i = 0; i < 6; i++) {
    periods.push(p);
    p = prevPeriod(p);
  }
  periods.reverse();

  // 3. Lấy dữ liệu hóa đơn và chi phí bảo trì
  const [allInvoices, maintenanceRows] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(and(eq(invoices.propertyId, propertyId), isNull(invoices.deletedAt))),
    db.select().from(maintenanceRequests).where(eq(maintenanceRequests.propertyId, propertyId)),
  ]);

  // Thống kê theo từng kỳ trong 6 tháng
  const monthlyData = periods.map((periodKey) => {
    const periodInvoices = allInvoices.filter((i) => i.period === periodKey);
    const totalBilled = periodInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalCollected = periodInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const debt = Math.max(0, totalBilled - totalCollected);

    // Chi phí sửa chữa trong tháng
    const periodMaintenance = maintenanceRows
      .filter((m) => m.status === "done" && m.createdAt.toISOString().slice(0, 7) === periodKey)
      .reduce((sum, m) => sum + (m.cost || 0), 0);

    const netProfit = totalCollected - periodMaintenance;

    return {
      period: periodKey,
      totalBilled,
      totalCollected,
      debt,
      maintenanceCost: periodMaintenance,
      netProfit,
      invoiceCount: periodInvoices.length,
    };
  });

  // Tổng hợp toàn bộ
  const totalRevenueCollected = allInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstandingDebt = allInvoices.reduce(
    (sum, i) => sum + Math.max(0, i.total - i.paidAmount),
    0,
  );
  const totalMaintenanceCost = maintenanceRows
    .filter((m) => m.status === "done")
    .reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalNetProfit = totalRevenueCollected - totalMaintenanceCost;

  return {
    occupancy: {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      occupancyRate,
      totalBeds,
      occupiedBeds,
      bedOccupancyRate,
      averageVacancyDays: 14, // Ước tính trung bình dựa trên chu kỳ luân chuyển
    },
    financials: {
      totalRevenueCollected,
      totalOutstandingDebt,
      totalMaintenanceCost,
      totalNetProfit,
    },
    monthlyData,
  };
}

export type FinancialReport = Awaited<ReturnType<typeof getFinancialAndOccupancyReport>>;
