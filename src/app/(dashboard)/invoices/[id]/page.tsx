import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { PrintButton } from "@/components/shared/print-button";
import { PaymentSheet } from "@/features/invoices/components/payment-sheet";
import { getInvoiceDetail } from "@/features/invoices/queries";
import { formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { propertyId } = await requireContext();
  const t = await getTranslations();
  const detail = await getInvoiceDetail(propertyId, id);
  if (!detail) notFound();
  const { invoice, roomName, tenantName, payments } = detail;
  const remaining = invoice.total - invoice.paidAmount;

  return (
    <>
      <PageHeader
        title={t("invoices.title", { period: formatPeriodShort(invoice.period) })}
        description={roomName}
        action={<PrintButton />}
      />
      <div className="flex flex-col gap-6">
        <InvoiceSheet today={todayVn()} data={{ ...invoice, roomName, tenantName }} />

        {remaining > 0 ? (
          <div className="no-print">
            <PaymentSheet propertyId={propertyId} invoiceId={invoice.id} remaining={remaining} />
          </div>
        ) : null}

        <section aria-labelledby="pay-title" className="max-w-md">
          <h2 id="pay-title" className="mb-3 text-lg font-semibold">
            {t("invoices.payments")}
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-muc-phu">{t("invoices.noPayments")}</p>
          ) : (
            <ul className="divide-y divide-suong rounded-panel border border-suong bg-mat">
              {payments.map((p) => (
                <li key={p.id} className="flex min-h-12 items-center gap-3 px-4 py-2">
                  <span className="flex-1 text-sm">
                    {formatDate(p.paidAt)} · {t(`invoices.${p.method}`)}
                  </span>
                  <span className="font-medium tabular-nums">{formatMoney(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
