import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EndContractButton } from "@/features/contracts/components/end-contract-button";
import { listContracts } from "@/features/contracts/queries";
import { formatDate, todayVn } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function ContractsPage() {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { propertyId } = ctx;
  const t = await getTranslations("contracts");
  const rows = await listContracts(propertyId);
  const today = todayVn();

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={t("title")}
        description={`${rows.length} hợp đồng đã ghi nhận`}
        action={
          <Link href="/contracts/new" className={buttonVariants({ variant: "primary" })}>
            <Plus size={18} aria-hidden="true" />
            <span>{t("create")}</span>
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          icon={FileText}
          action={
            <Link href="/contracts/new" className={buttonVariants({ variant: "primary" })}>
              <Plus size={18} aria-hidden="true" />
              <span>{t("create")}</span>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-primary/40 hover:bg-card/90 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-foreground">
                    {r.roomName}
                  </span>
                  <StatusBadge kind={r.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Người đại diện:{" "}
                  <span className="text-muted-foreground">{r.tenantName ?? "—"}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  {formatDate(r.startDate)} → {r.endDate ? formatDate(r.endDate) : t("openEnded")}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-4">
                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-muted-foreground">Giá thuê</span>
                  <span className="font-mono text-base font-bold tabular-nums text-foreground">
                    {formatMoney(r.rentPrice)}
                  </span>
                </div>
                {r.status === "active" ? (
                  <EndContractButton propertyId={propertyId} contractId={r.id} today={today} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
