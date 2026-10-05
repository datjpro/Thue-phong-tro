import { ArrowLeft, Plus, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EndContractButton } from "@/features/contracts/components/end-contract-button";
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
    <PageTransition className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Danh sách phòng</span>
        </Link>
      </div>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>{room.name}</span>
            <StatusBadge kind={room.status} />
          </div>
        }
        description={
          primaryTenant ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User size={15} />
              <span>{primaryTenant}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{t("rooms.noTenant")}</span>
          )
        }
        action={
          contract ? (
            <EndContractButton propertyId={propertyId} contractId={contract.id} today={today} />
          ) : (
            <Link
              href={`/contracts/new?roomId=${room.id}`}
              className={buttonVariants({ variant: "primary" })}
            >
              <Plus size={16} />
              <span>{t("contracts.create")}</span>
            </Link>
          )
        }
      />

      {/* Room metadata cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("rooms.rentPrice")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-foreground tabular-nums">
            {formatMoney(contract ? contract.rentPrice : room.rentPrice)}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("rooms.area")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-foreground">
            {room.area ? `${room.area} m²` : "—"}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("rooms.floor")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-foreground">
            {room.floor ? `Tầng ${room.floor}` : "Tầng 1"}
          </p>
        </div>
      </div>

      {/* Section: Hóa đơn tháng hiện tại */}
      <section aria-labelledby="month-title" className="space-y-3">
        <h2
          id="month-title"
          className="text-base sm:text-lg font-bold tracking-tight text-foreground"
        >
          {t("common.month", { value: formatPeriodShort(period) })}
        </h2>

        {monthInvoice ? (
          <div className="flex flex-col gap-4">
            <InvoiceSheet
              today={today}
              data={{ ...monthInvoice, roomName: room.name, tenantName: primaryTenant }}
            />
            <div className="flex">
              <Link
                href={`/invoices/${monthInvoice.id}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                {t("invoices.open")}
              </Link>
            </div>
          </div>
        ) : contract && property ? (
          <div className="flex flex-col gap-4 max-w-md">
            <EmptyState
              title={t("invoices.noneTitle")}
              description={t("invoices.noneDesc")}
              action={
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
              }
            />
          </div>
        ) : (
          <EmptyState
            title={t("rooms.noContractTitle")}
            description={t("rooms.noContractDesc")}
            action={
              <Link
                href={`/contracts/new?roomId=${room.id}`}
                className={buttonVariants({ variant: "primary" })}
              >
                <Plus size={16} />
                <span>{t("contracts.create")}</span>
              </Link>
            }
          />
        )}
      </section>

      {/* History of past invoices */}
      {history.length > 0 ? (
        <section aria-labelledby="history-title" className="space-y-3 pt-4">
          <h2
            id="history-title"
            className="text-base sm:text-lg font-bold tracking-tight text-foreground"
          >
            {t("rooms.history")}
          </h2>
          <div className="flex max-w-lg flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
            {history.map((i) => (
              <Link
                key={i.id}
                href={`/invoices/${i.id}`}
                className="flex min-h-12 items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
              >
                <span className="font-medium text-foreground">
                  {t("common.month", { value: formatPeriodShort(i.period) })}
                </span>
                <div className="flex items-center gap-3">
                  <StatusBadge kind={invoiceDisplayStatus(i.status, i.dueDate, today)} />
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                    {formatMoney(i.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageTransition>
  );
}
