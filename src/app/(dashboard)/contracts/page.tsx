import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EndContractButton } from "@/features/contracts/components/end-contract-button";
import { listContracts } from "@/features/contracts/queries";
import { formatDate, todayVn } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function ContractsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("contracts");
  const rows = await listContracts(propertyId);
  const today = todayVn();

  return (
    <>
      <PageHeader
        title={t("title")}
        action={
          <Link href="/contracts/new" className={buttonVariants()}>
            <Plus size={20} aria-hidden="true" />
            {t("create")}
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} />
      ) : (
        <ul className="flex flex-col divide-y divide-suong rounded-panel border border-suong bg-mat">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {r.roomName} · {r.tenantName ?? "—"}
                </p>
                <p className="text-sm text-muc-phu">
                  {formatDate(r.startDate)} → {r.endDate ? formatDate(r.endDate) : t("openEnded")}
                </p>
              </div>
              <span className="font-medium tabular-nums">{formatMoney(r.rentPrice)}</span>
              <StatusBadge kind={r.status} />
              {r.status === "active" ? (
                <EndContractButton propertyId={propertyId} contractId={r.id} today={today} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
