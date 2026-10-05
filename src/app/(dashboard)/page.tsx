import {
  AlertTriangle,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Plus,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { StatsCard } from "@/components/shared/stats-card";
import { buttonVariants } from "@/components/ui/button";
import { RoomList } from "@/features/rooms/components/room-list";
import { getRoomDetail, listRooms } from "@/features/rooms/queries";
import { TenantHomeView } from "@/features/tenants/components/tenant-home-view";
import { currentPeriod, formatPeriodShort, nextPeriod, prevPeriod, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

interface PageProps {
  searchParams: Promise<{ period?: string; filter?: string }>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const ctx = await requireContext();
  const t = await getTranslations();
  const params = await searchParams;

  const nowPeriod = currentPeriod();
  const period = params.period && /^\d{4}-\d{2}$/.test(params.period) ? params.period : nowPeriod;

  // Cổng người thuê: hiển thị phòng của người thuê
  if (ctx.role === "tenant") {
    if (ctx.roomId) {
      const detail = await getRoomDetail(ctx.propertyId, ctx.roomId, period);
      if (detail) {
        return <TenantHomeView propertyId={ctx.propertyId} detail={detail} />;
      }
    }
    return (
      <PageTransition className="mx-auto max-w-md space-y-6">
        <EmptyState
          title="Chưa có phòng liên kết"
          description="Tài khoản của bạn chưa được liên kết với phòng trọ nào đang hoạt động. Vui lòng liên hệ chủ trọ để được kích hoạt."
        />
      </PageTransition>
    );
  }

  const { propertyId } = ctx;
  const filter = params.filter;
  const today = todayVn();

  const prev = prevPeriod(period);
  const next = nextPeriod(period);
  const isCurrentMonth = period === nowPeriod;

  const rows = await listRooms(propertyId, period);

  const occupied = rows.filter((r) => r.hasActiveContract);
  const needReadings = occupied.filter((r) => !r.invoice).length;
  const unpaid = occupied.filter((r) => r.invoice && r.invoice.status !== "paid");
  const overdue = unpaid.filter(
    (r) =>
      r.invoice && invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today) === "overdue",
  ).length;
  const toCollect = unpaid.reduce(
    (s, r) => s + (r.invoice ? r.invoice.total - r.invoice.paidAmount : 0),
    0,
  );
  const vacant = rows.filter((r) => !r.hasActiveContract).length;

  // Filter rows if user clicked on a stat card
  const filteredRows = rows.filter((r) => {
    if (!filter) return true;
    if (filter === "needReadings") return r.hasActiveContract && !r.invoice;
    if (filter === "unpaid") return r.invoice && r.invoice.status !== "paid";
    if (filter === "overdue") {
      return (
        r.invoice && invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today) === "overdue"
      );
    }
    if (filter === "vacant") return !r.hasActiveContract;
    return true;
  });

  return (
    <PageTransition>
      {/* 5.1 Header với chọn tháng (chevron trái/phải) và subtitle */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{t("overview.title", { period: formatPeriodShort(period) })}</span>
            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card p-1 shadow-2xs">
              <Link
                href={`/?period=${prev}${filter ? `&filter=${filter}` : ""}`}
                aria-label="Tháng trước"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/?period=${next}${filter ? `&filter=${filter}` : ""}`}
                aria-label="Tháng sau"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
            {!isCurrentMonth ? (
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <RotateCcw size={12} />
                Tháng này
              </Link>
            ) : null}
          </div>
        }
        description={t("overview.subtitle")}
        action={
          <Link href="/rooms/new" className={buttonVariants({ variant: "primary" })}>
            <Plus size={18} aria-hidden="true" />
            <span>{t("rooms.add")}</span>
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t("overview.emptyTitle")}
          description={t("overview.emptyDesc")}
          action={
            <Link href="/rooms/new" className={buttonVariants({ variant: "primary" })}>
              <Plus size={18} aria-hidden="true" />
              <span>{t("rooms.add")}</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* 5.2 Stats Cards: 4 card ngang desktop, 2x2 mobile */}
          <section aria-label="Thống kê tổng quan">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatsCard
                label={t("overview.needReadings")}
                value={String(needReadings)}
                icon={Gauge}
                tone={needReadings > 0 ? "warning" : "default"}
                href={`/?period=${period}&filter=needReadings`}
              />
              <StatsCard
                label={t("overview.unpaid")}
                value={String(unpaid.length)}
                icon={Clock}
                tone={unpaid.length > 0 ? "warning" : "default"}
                href={`/?period=${period}&filter=unpaid`}
              />
              <StatsCard
                label={t("overview.overdue")}
                value={String(overdue)}
                icon={AlertTriangle}
                tone={overdue > 0 ? "destructive" : "default"}
                href={`/?period=${period}&filter=overdue`}
              />
              <StatsCard
                label={t("overview.toCollect")}
                value={formatMoney(toCollect)}
                icon={Banknote}
                tone={toCollect > 0 ? "primary" : "default"}
                href="/invoices"
              />
            </div>
          </section>

          {/* 5.3 Danh sách phòng */}
          <section aria-label="Danh sách phòng" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  {t("rooms.title")}
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({occupied.length} đang thuê
                  {vacant > 0 ? ` · ${t("overview.vacant", { count: vacant })}` : ""})
                </span>
              </div>

              {filter ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Đang lọc:{" "}
                    <strong className="text-primary font-medium">
                      {filter === "needReadings" && t("overview.needReadings")}
                      {filter === "unpaid" && t("overview.unpaid")}
                      {filter === "overdue" && t("overview.overdue")}
                      {filter === "vacant" && t("status.vacant")}
                    </strong>
                  </span>
                  <Link
                    href={`/?period=${period}`}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Xóa lọc
                  </Link>
                </div>
              ) : null}
            </div>

            {filteredRows.length === 0 ? (
              <EmptyState
                title="Không có phòng phù hợp"
                description="Không tìm thấy phòng nào với điều kiện lọc hiện tại."
                action={
                  <Link
                    href={`/?period=${period}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Xem tất cả phòng
                  </Link>
                }
              />
            ) : (
              <RoomList rows={filteredRows} today={today} />
            )}
          </section>
        </div>
      )}
    </PageTransition>
  );
}
