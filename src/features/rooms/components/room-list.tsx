import { ChevronRight, DoorClosed, Gauge, User } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type RoomRow = {
  id: string;
  name: string;
  status: "vacant" | "occupied" | "maintenance";
  tenantName: string | null;
  hasActiveContract: boolean;
  invoice: { total: number; status: "unpaid" | "partial" | "paid"; dueDate: string } | null;
};

/**
 * Danh sách phòng: hiển thị dạng card ngang hiện đại (UX-UI 5.3),
 * hoạt động mượt mà cho cả 1 phòng lẫn nhiều phòng.
 */
export function RoomList({
  rows,
  today,
  className,
}: {
  rows: RoomRow[];
  today: string;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {rows.map((r) => {
        const needsReading = r.hasActiveContract && !r.invoice;
        const invStatus = r.invoice
          ? invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today)
          : null;

        return (
          <div
            key={r.id}
            className="group relative flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm transition-all duration-150 hover:border-primary/40 hover:bg-card/90 sm:flex-row sm:items-center"
          >
            {/* Left info: Icon, Room Name, Tenant */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <DoorClosed size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/rooms/${r.id}`}
                    className="text-base sm:text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {r.name}
                  </Link>
                  <StatusBadge kind={r.status} />
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                  <User
                    size={14}
                    className="shrink-0 text-muted-foreground/70"
                    aria-hidden="true"
                  />
                  <span className="truncate">{r.tenantName ?? t("rooms.noTenant")}</span>
                </div>
              </div>
            </div>

            {/* Right info: Invoice status, Amount, Action CTA */}
            <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-3 shrink-0">
              <div className="flex flex-col sm:items-end gap-0.5">
                {r.invoice && invStatus ? (
                  <>
                    <StatusBadge kind={invStatus} />
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {formatMoney(r.invoice.total)}
                    </span>
                  </>
                ) : needsReading ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                    <Gauge size={13} aria-hidden="true" />
                    {t("rooms.needReadings")}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("status.vacant")}</span>
                )}
              </div>

              {/* Action button leading to room */}
              <Link
                href={`/rooms/${r.id}`}
                aria-label={`Xem chi tiết ${r.name}`}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-secondary-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
