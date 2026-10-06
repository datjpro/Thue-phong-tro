import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { InvoicesManager } from "@/features/invoices/components/invoices-manager";
import { getBatchInvoiceContext, listInvoices } from "@/features/invoices/queries";
import { todayVn } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function InvoicesPage() {
  const ctx = await requireContext();
  const t = await getTranslations();
  const isTenant = ctx.role === "tenant";

  const allRows = await listInvoices(ctx.propertyId);
  const rows = isTenant ? allRows.filter((r) => r.roomId === ctx.roomId) : allRows;
  const currentPeriod = todayVn().slice(0, 7);

  // Lấy danh sách các kỳ hóa đơn hiện có
  const periodSet = new Set(rows.map((r) => r.period));
  periodSet.add(currentPeriod);
  const periods = [...periodSet].sort().reverse();

  const batchContext = !isTenant
    ? await getBatchInvoiceContext(ctx.propertyId, periods[0] || currentPeriod)
    : null;

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={isTenant ? "Hóa đơn phòng của bạn" : t("invoices.listTitle")}
        description={
          isTenant
            ? `${rows.length} hóa đơn đã phát hành cho ${ctx.roomName ? `phòng ${ctx.roomName}` : "phòng bạn"}`
            : `${rows.length} hóa đơn đã phát hành trong hệ thống`
        }
      />

      <InvoicesManager
        propertyId={ctx.propertyId}
        propertyName={batchContext?.property?.name || "Khu trọ"}
        invoices={rows}
        periods={periods}
        isTenant={isTenant}
        batchContext={
          batchContext
            ? {
                candidates: batchContext.candidates,
                electricPrice: batchContext.property.electricPrice,
                waterPrice: batchContext.property.waterPrice,
              }
            : null
        }
      />
    </PageTransition>
  );
}
