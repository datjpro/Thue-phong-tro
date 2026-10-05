import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { listInvoices } from "@/features/invoices/queries";
import { formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function InvoicesPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations();
  const rows = await listInvoices(propertyId);
  const today = todayVn();

  return (
    <>
      <PageHeader title={t("invoices.listTitle")} />
      {rows.length === 0 ? (
        <EmptyState title={t("invoices.noneTitle")} description={t("invoices.noneDesc")} />
      ) : (
        <>
          {/* Desktop: bảng; mobile: danh sách dòng (UX-UI 7.4) */}
          <div className="hidden overflow-hidden rounded-panel border border-suong bg-mat md:block">
            <table className="w-full text-left">
              <thead className="border-b border-suong text-sm text-muc-phu">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("invoices.period")}</th>
                  <th className="px-4 py-3 font-medium">{t("contracts.room")}</th>
                  <th className="px-4 py-3 font-medium">{t("invoices.dueLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.status")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("invoices.total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-suong">
                {rows.map((r) => (
                  <tr key={r.id} className="h-14 hover:bg-giay">
                    <td className="px-4">
                      <Link
                        href={`/invoices/${r.id}`}
                        className="font-medium text-la underline-offset-2 hover:underline"
                      >
                        {t("common.month", { value: formatPeriodShort(r.period) })}
                      </Link>
                    </td>
                    <td className="px-4">{r.roomName}</td>
                    <td className="px-4">{formatDate(r.dueDate)}</td>
                    <td className="px-4">
                      <StatusBadge kind={invoiceDisplayStatus(r.status, r.dueDate, today)} />
                    </td>
                    <td className="px-4 text-right font-medium tabular-nums">
                      {formatMoney(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col divide-y divide-suong rounded-panel border border-suong bg-mat md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/invoices/${r.id}`} className="flex min-h-14 flex-col gap-1 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {r.roomName} · {formatPeriodShort(r.period)}
                    </span>
                    <span className="font-medium tabular-nums">{formatMoney(r.total)}</span>
                  </div>
                  <StatusBadge
                    kind={invoiceDisplayStatus(r.status, r.dueDate, today)}
                    className="self-start"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
