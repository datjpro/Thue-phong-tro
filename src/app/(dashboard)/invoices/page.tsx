import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { listInvoices } from "@/features/invoices/queries";
import { formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";
import { cn } from "@/lib/utils";

interface InvoicesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const ctx = await requireContext();
  const t = await getTranslations();
  const { status: statusFilter } = await searchParams;
  const allRows = await listInvoices(ctx.propertyId);
  const rows = ctx.role === "tenant" ? allRows.filter((r) => r.roomId === ctx.roomId) : allRows;
  const today = todayVn();

  const filteredRows = rows.filter((r) => {
    if (!statusFilter) return true;
    const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
    if (statusFilter === "unpaid") return r.status !== "paid";
    if (statusFilter === "paid") return r.status === "paid";
    if (statusFilter === "overdue") return dispStatus === "overdue";
    return true;
  });

  const filterTabs = [
    { label: "Tất cả", value: undefined, href: "/invoices" },
    { label: t("status.unpaid"), value: "unpaid", href: "/invoices?status=unpaid" },
    { label: t("status.overdue"), value: "overdue", href: "/invoices?status=overdue" },
    { label: t("status.paid"), value: "paid", href: "/invoices?status=paid" },
  ];

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={ctx.role === "tenant" ? "Hóa đơn phòng của bạn" : t("invoices.listTitle")}
        description={
          ctx.role === "tenant"
            ? `${rows.length} hóa đơn đã phát hành cho ${ctx.roomName ? `phòng ${ctx.roomName}` : "phòng bạn"}`
            : `${rows.length} hóa đơn đã phát hành`
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t("invoices.noneTitle")} description={t("invoices.noneDesc")} />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="Không tìm thấy hóa đơn"
          description="Không có hóa đơn nào phù hợp với bộ lọc hiện tại."
          action={
            <Link
              href="/invoices"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Xem tất cả hóa đơn
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop view: Bảng hiện đại */}
          <div className="hidden overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm md:block">
            <table className="w-full text-left">
              <thead className="border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("invoices.period")}</th>
                  <th className="px-4 py-3">{t("contracts.room")}</th>
                  <th className="px-4 py-3">{t("invoices.dueLabel")}</th>
                  <th className="px-4 py-3">{t("common.status")}</th>
                  <th className="px-4 py-3 text-right">{t("invoices.total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRows.map((r) => {
                  const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
                  return (
                    <tr key={r.id} className="h-14 hover:bg-muted/30 transition-colors">
                      <td className="px-4">
                        <Link
                          href={`/invoices/${r.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                        >
                          {t("common.month", { value: formatPeriodShort(r.period) })}
                        </Link>
                      </td>
                      <td className="px-4 font-medium text-foreground">{r.roomName}</td>
                      <td className="px-4 text-sm text-muted-foreground font-mono">
                        {formatDate(r.dueDate)}
                      </td>
                      <td className="px-4">
                        <StatusBadge kind={dispStatus} />
                      </td>
                      <td className="px-4 text-right font-mono font-semibold tabular-nums text-foreground">
                        {formatMoney(r.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile view: Danh sách card */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredRows.map((r) => {
              const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
              return (
                <Link
                  key={r.id}
                  href={`/invoices/${r.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm active:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-base text-foreground">
                      {r.roomName} · {formatPeriodShort(r.period)}
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-primary">
                      {formatMoney(r.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                    <StatusBadge kind={dispStatus} />
                    <span className="font-mono">Hạn: {formatDate(r.dueDate)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </PageTransition>
  );
}
