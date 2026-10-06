import { Banknote, Building, CheckCircle2, Clock, TrendingUp, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { getFinancialAndOccupancyReport } from "@/features/reports/queries";
import { formatPeriodShort } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function ReportsPage() {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const data = await getFinancialAndOccupancyReport(ctx.propertyId);
  const { occupancy, financials, monthlyData } = data;

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Báo cáo & Phân tích"
        description="Theo dõi dòng tiền, lợi nhuận thực tế và tỷ lệ lấp đầy phòng trọ"
      />

      {/* 1. Tỷ lệ lấp đầy (Occupancy Rate) */}
      <section aria-label="Tỷ lệ lấp đầy" className="space-y-3">
        <div className="flex items-center gap-2">
          <Building size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Tỷ lệ lấp đầy & Hiệu suất phòng</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Tỷ lệ lấp đầy phòng</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {occupancy.occupancyRate}%
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                ({occupancy.occupiedRooms}/{occupancy.totalRooms} phòng)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${occupancy.occupancyRate}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Phòng còn trống</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {occupancy.vacantRooms}
              </span>
              <span className="text-xs text-muted-foreground">phòng sẵn sàng</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {occupancy.vacantRooms === 0
                ? "Tuyệt vời! Đã lấp đầy 100%"
                : "Cần đẩy mạnh đăng tin cho thuê"}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Lấp đầy KTX / Sleepbox
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {occupancy.totalBeds > 0 ? `${occupancy.bedOccupancyRate}%` : "—"}
              </span>
              {occupancy.totalBeds > 0 ? (
                <span className="text-xs text-muted-foreground">
                  ({occupancy.occupiedBeds}/{occupancy.totalBeds} giường)
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {occupancy.totalBeds > 0 ? "Theo từng slot giường" : "Không áp dụng mô hình KTX"}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Thời gian trống TB</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                ~{occupancy.averageVacancyDays}
              </span>
              <span className="text-xs text-muted-foreground">ngày / phòng</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">Giữa 2 lượt khách thuê</p>
          </div>
        </div>
      </section>

      {/* 2. Tổng quan Dòng tiền & Lợi nhuận ròng */}
      <section aria-label="Dòng tiền" className="space-y-3">
        <div className="flex items-center gap-2">
          <Banknote size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Dòng tiền & Lợi nhuận ròng</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Doanh thu thực thu</span>
            <p className="text-xl sm:text-2xl font-bold text-foreground font-mono">
              {formatMoney(financials.totalRevenueCollected)}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
              <TrendingUp size={13} />
              <span>Tiền đã vào tài khoản / két</span>
            </span>
          </div>

          <div className="rounded-xl border border-amber-300/80 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Công nợ tồn đọng</span>
            <p className="text-xl sm:text-2xl font-bold text-foreground font-mono">
              {formatMoney(financials.totalOutstandingDebt)}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              <Clock size={13} />
              <span>Chưa thu / quá hạn</span>
            </span>
          </div>

          <div className="rounded-xl border border-rose-300/80 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20 p-4 shadow-2xs space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Chi phí bảo trì / sửa chữa
            </span>
            <p className="text-xl sm:text-2xl font-bold text-foreground font-mono">
              {formatMoney(financials.totalMaintenanceCost)}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
              <Wrench size={13} />
              <span>Các phiếu sửa chữa đã duyệt</span>
            </span>
          </div>

          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-2xs space-y-1">
            <span className="text-xs text-primary font-bold">Lợi nhuận ròng</span>
            <p className="text-xl sm:text-2xl font-bold text-primary font-mono">
              {formatMoney(financials.totalNetProfit)}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              <CheckCircle2 size={13} />
              <span>Thực thu – Chi phí bảo trì</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Bảng tổng kết dòng tiền qua từng tháng */}
      <section aria-label="Bảng kê chi tiết theo tháng" className="space-y-3">
        <h2 className="text-base font-bold text-foreground">Chi tiết dòng tiền 6 tháng gần nhất</h2>

        <div className="rounded-xl border border-border/60 bg-card shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border/60 uppercase">
              <tr>
                <th className="px-4 py-3">Kỳ hóa đơn</th>
                <th className="px-4 py-3">Tổng phát sinh</th>
                <th className="px-4 py-3">Thực thu</th>
                <th className="px-4 py-3">Còn nợ</th>
                <th className="px-4 py-3">Chi phí bảo trì</th>
                <th className="px-4 py-3 text-right">Lợi nhuận ròng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {monthlyData.map((m) => (
                <tr key={m.period} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-sans font-bold text-foreground">
                    Tháng {formatPeriodShort(m.period)}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{formatMoney(m.totalBilled)}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">
                    {formatMoney(m.totalCollected)}
                  </td>
                  <td className="px-4 py-3.5 text-amber-600">
                    {m.debt > 0 ? formatMoney(m.debt) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-rose-600">
                    {m.maintenanceCost > 0 ? formatMoney(m.maintenanceCost) : "0₫"}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-primary text-right">
                    {formatMoney(m.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageTransition>
  );
}
