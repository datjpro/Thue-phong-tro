import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { MeterSheet } from "@/features/invoices/components/meter-sheet";
import { listInvoices } from "@/features/invoices/queries";
import { getRoomDetail } from "@/features/rooms/queries";
import { currentPeriod, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { propertyId } = await requireContext();
  const t = await getTranslations();
  const period = currentPeriod();
  const today = todayVn();

  const detail = await getRoomDetail(propertyId, id, period);
  if (!detail) notFound();
  const { room, property, contract, tenants, lastReading, monthInvoice } = detail;

  const history = (await listInvoices(propertyId)).filter(
    (i) => i.roomId === id && i.period !== period,
  );
  const primaryTenant = tenants[0]?.fullName ?? null;

  return (
    <>
      <PageHeader
        title={room.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge kind={room.status} />
            {primaryTenant ? <span>{primaryTenant}</span> : null}
          </span>
        }
      />

      <section aria-labelledby="month-title" className="mb-8">
        <h2 id="month-title" className="mb-3 text-lg font-semibold">
          {t("common.month", { value: formatPeriodShort(period) })}
        </h2>

        {monthInvoice ? (
          <div className="flex flex-col gap-3">
            <InvoiceSheet
              today={today}
              data={{ ...monthInvoice, roomName: room.name, tenantName: primaryTenant }}
            />
            <Link
              href={`/invoices/${monthInvoice.id}`}
              className={buttonVariants({ className: "w-full sm:w-auto sm:self-start" })}
            >
              {t("invoices.open")}
            </Link>
          </div>
        ) : contract && property ? (
          <div className="flex flex-col gap-3">
            <EmptyState title={t("invoices.noneTitle")} description={t("invoices.noneDesc")} />
            <MeterSheet
              propertyId={propertyId}
              roomId={room.id}
              period={period}
              prevElectric={lastReading?.electricCurr ?? 0}
              prevWater={lastReading?.waterCurr ?? 0}
              electricPrice={property.electricPrice}
              waterPrice={property.waterPrice}
              monthlyRent={contract.rentPrice}
              contractStart={contract.startDate}
              contractEnd={contract.endDate}
            />
          </div>
        ) : (
          <EmptyState
            title={t("rooms.noContractTitle")}
            description={t("rooms.noContractDesc")}
            action={
              <Link href={`/contracts/new?roomId=${room.id}`} className={buttonVariants()}>
                {t("contracts.create")}
              </Link>
            }
          />
        )}
      </section>

      {history.length > 0 ? (
        <section aria-labelledby="history-title">
          <h2 id="history-title" className="mb-3 text-lg font-semibold">
            {t("rooms.history")}
          </h2>
          <ul className="flex max-w-md flex-col divide-y divide-suong rounded-panel border border-suong bg-mat">
            {history.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/invoices/${i.id}`}
                  className="flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-giay"
                >
                  <span className="flex-1">
                    {t("common.month", { value: formatPeriodShort(i.period) })}
                  </span>
                  <StatusBadge kind={invoiceDisplayStatus(i.status, i.dueDate, today)} />
                  <span className="min-w-24 text-right font-medium tabular-nums">
                    {formatMoney(i.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
