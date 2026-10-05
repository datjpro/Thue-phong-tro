import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { PrintButton } from "@/components/shared/print-button";
import { PaymentSheet } from "@/features/invoices/components/payment-sheet";
import { getInvoiceDetail } from "@/features/invoices/queries";
import { formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  const t = await getTranslations();
  const detail = await getInvoiceDetail(ctx.propertyId, id);
  if (!detail) notFound();

  // Kiểm tra quyền truy cập: nếu là người thuê thì chỉ được xem hóa đơn phòng mình
  if (ctx.role === "tenant" && detail.invoice.roomId !== ctx.roomId) {
    notFound();
  }

  const { invoice, roomName, tenantName, payments } = detail;
  const remaining = invoice.total - invoice.paidAmount;

  return (
    <PageTransition className="space-y-6">
      <div className="no-print">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Danh sách hóa đơn</span>
        </Link>
      </div>

      <PageHeader
        title={t("invoices.title", { period: formatPeriodShort(invoice.period) })}
        description={`${roomName}${tenantName ? ` · ${tenantName}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <PrintButton />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Tờ hóa đơn tháng (thành phần đặc trưng) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <InvoiceSheet today={todayVn()} data={{ ...invoice, roomName, tenantName }} />

          {remaining > 0 ? (
            <div className="no-print max-w-md pt-2">
              {ctx.role !== "tenant" ? (
                <PaymentSheet
                  propertyId={ctx.propertyId}
                  invoiceId={invoice.id}
                  remaining={remaining}
                />
              ) : (
                <div className="rounded-xl border border-suong bg-mat p-4 text-center">
                  <p className="text-sm font-semibold text-muc">Thông tin thanh toán</p>
                  <p className="mt-1 text-xs text-muc-phu">
                    Số tiền còn lại cần thanh toán:{" "}
                    <strong className="text-muc font-bold">{formatMoney(remaining)}</strong>. Vui
                    lòng liên hệ chủ trọ để nộp tiền mặt hoặc chuyển khoản theo hướng dẫn của chủ
                    nhà.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Cột phải: Lịch sử các đợt thanh toán */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <section
            aria-labelledby="pay-title"
            className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <h2 id="pay-title" className="text-base font-bold tracking-tight text-foreground mb-3">
              {t("invoices.payments")}
            </h2>
            {payments.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("invoices.noPayments")}</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {payments.map((p) => (
                  <li key={p.id} className="flex min-h-12 items-center justify-between gap-3 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {t(`invoices.${p.method}`)}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(p.paidAt)}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums text-success">
                      +{formatMoney(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
