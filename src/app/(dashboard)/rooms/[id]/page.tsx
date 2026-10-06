import { Bed, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssetManager } from "@/features/assets/components/asset-manager";
import { EndContractButton } from "@/features/contracts/components/end-contract-button";
import { MeterSheet } from "@/features/invoices/components/meter-sheet";
import { listInvoices } from "@/features/invoices/queries";
import { RoomStatusDropdown } from "@/features/rooms/components/room-status-dropdown";
import { getRoomTypeLabel } from "@/features/rooms/constants";
import { getRoomDetail } from "@/features/rooms/queries";
import { getContractServices, listPropertyServices } from "@/features/services/queries";
import { TenantAccountCard } from "@/features/tenants/components/tenant-account-card";
import { currentPeriod, formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { propertyId } = ctx;
  const t = await getTranslations();
  const period = currentPeriod();
  const today = todayVn();

  const detail = await getRoomDetail(propertyId, id, period);
  if (!detail) notFound();
  const {
    room,
    property,
    contract,
    tenants,
    lastReading,
    monthInvoice,
    monthReading,
    beds,
    assets,
  } = detail;

  const primaryTenant = tenants[0]?.fullName ?? "";

  const history = (await listInvoices(propertyId)).filter(
    (i) => i.roomId === id && i.period !== period,
  );
  const contractSvcs = contract ? await getContractServices(propertyId, contract.id) : [];
  const defaultServices =
    contractSvcs.length > 0
      ? contractSvcs.map((cs) => ({
          id: cs.serviceId,
          name: cs.name,
          amount: cs.effectivePrice,
          quantity: cs.quantity,
        }))
      : (await listPropertyServices(propertyId))
          .filter((s) => s.isActive === "yes")
          .map((s) => ({
            id: s.id,
            name: s.name,
            amount: s.unitPrice,
            quantity: 1,
          }));

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-8 pb-12 lg:pb-8">
      {/* Top Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{room.name}</h1>
            {room.roomType ? (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {getRoomTypeLabel(room.roomType)}
              </span>
            ) : null}
            <RoomStatusDropdown
              propertyId={propertyId}
              roomId={room.id}
              currentStatus={room.status as "vacant" | "occupied" | "maintenance"}
              hasActiveContract={!!contract}
            />
          </div>

          <div className="flex items-center gap-2">
            {contract ? (
              <EndContractButton propertyId={propertyId} contractId={contract.id} today={today} />
            ) : (
              <Link
                href={`/contracts/new?roomId=${room.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                <Plus size={14} />
                <span>{t("contracts.create")}</span>
              </Link>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {primaryTenant ? `${primaryTenant} · đang thuê` : "Chưa có người thuê"}
          {room.area ? ` · ${room.area}m²` : ""}
          {room.floor ? ` · Tầng ${room.floor}` : ""}
        </p>
      </header>

      {/* Danh sách giường KTX / Sleepbox nếu có */}
      {room.roomType !== "standard" && beds.length > 0 ? (
        <section
          aria-labelledby="beds-title"
          className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-primary" />
            <h2 id="beds-title" className="text-sm font-bold text-foreground">
              Vị trí giường / Sleepbox ({beds.filter((b) => b.status === "occupied").length}/
              {beds.length} đã thuê)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {beds.map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between rounded-lg border border-border/60 p-2.5 bg-muted/20 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{b.name}</span>
                  <span
                    className={`size-2 rounded-full ${
                      b.status === "occupied"
                        ? "bg-emerald-500"
                        : b.status === "maintenance"
                          ? "bg-rose-500"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  {formatMoney(b.rentPrice)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Section 1: Tháng hiện tại - Tờ hóa đơn tháng */}
      <section aria-labelledby="month-title" className="space-y-3">
        <h2 id="month-title" className="text-lg font-semibold text-foreground">
          {t("common.month", { value: formatPeriodShort(period) })}
        </h2>

        {monthInvoice ? (
          <InvoiceSheet
            today={today}
            data={{
              ...monthInvoice,
              roomName: room.name,
              tenantName: primaryTenant,
              electricPrev: monthReading?.electricPrev,
              electricCurr: monthReading?.electricCurr,
              waterPrev: monthReading?.waterPrev,
              waterCurr: monthReading?.waterCurr,
            }}
          />
        ) : contract && property ? (
          <div className="rounded-[4px] border border-dashed border-border bg-card/50 p-6 text-center">
            <p className="text-sm font-medium text-foreground">{t("invoices.noneTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("invoices.noneDesc")}</p>
          </div>
        ) : (
          <div className="rounded-[4px] border border-dashed border-border bg-card/50 p-6 text-center">
            <p className="text-sm font-medium text-foreground">{t("rooms.noContractTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("rooms.noContractDesc")}</p>
          </div>
        )}
      </section>

      {/* Section: Quản lý trang thiết bị & Bàn giao tài sản (Check-in/out) */}
      <section aria-labelledby="asset-title">
        <AssetManager
          propertyId={propertyId}
          roomId={room.id}
          roomName={room.name}
          contractId={contract?.id ?? null}
          tenantName={primaryTenant}
          assets={assets}
        />
      </section>

      {/* Section 2: Hợp đồng */}
      {contract ? (
        <section
          aria-labelledby="contract-title"
          className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <h2 id="contract-title" className="text-base font-semibold text-foreground">
              {t("nav.contracts")} ({contract.contractNumber || "HĐ"})
            </h2>
            <Link
              href={`/contracts/${contract.id}`}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Xem & In hợp đồng
            </Link>
          </div>
          <div className="border-t border-border/40 pt-2 space-y-1 text-xs sm:text-sm">
            <p className="text-foreground">
              {contract.endDate
                ? `Thời hạn: ${formatDate(contract.startDate)} → ${formatDate(contract.endDate)}`
                : `Bắt đầu từ ${formatDate(contract.startDate)} (Không thời hạn)`}
            </p>
            <p className="text-muted-foreground tabular-nums">
              Giá thuê:{" "}
              <strong className="text-foreground">{formatMoney(contract.rentPrice)}/tháng</strong> ·
              Cọc: <strong className="text-foreground">{formatMoney(contract.deposit)}</strong> ·
              Chu kỳ: {contract.billingCycle} tháng/lần
            </p>
          </div>
        </section>
      ) : null}

      {/* Section: Cấp & Quản lý Tài khoản người thuê */}
      {tenants[0] ? (
        <section aria-labelledby="tenant-account-title" className="space-y-3">
          <TenantAccountCard
            propertyId={propertyId}
            roomId={room.id}
            roomName={room.name}
            tenant={tenants[0]}
          />
        </section>
      ) : null}

      {/* Section 3: Lịch sử hóa đơn */}
      {history.length > 0 ? (
        <section aria-labelledby="history-title" className="space-y-3">
          <h2 id="history-title" className="text-lg font-semibold text-foreground">
            {t("rooms.history")}
          </h2>
          <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
            {history.map((i) => {
              const monthNum = Number(i.period.split("-")[1]);
              return (
                <Link
                  key={i.id}
                  href={`/invoices/${i.id}`}
                  className="flex h-12 items-center justify-between px-4 text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium text-foreground">Tháng {monthNum}</span>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums font-semibold text-foreground">
                      {formatMoney(i.total)}
                    </span>
                    <StatusBadge kind={invoiceDisplayStatus(i.status, i.dueDate, today)} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Nút hành động chính */}
      <div className="pt-2 pb-6">
        {!monthInvoice && contract && property ? (
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
            defaultServices={defaultServices}
          />
        ) : monthInvoice ? (
          <Link
            href={`/invoices/${monthInvoice.id}`}
            className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary text-base font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 active:scale-[0.99]"
          >
            {monthInvoice.paidAmount >= monthInvoice.total
              ? "Xem chi tiết hóa đơn"
              : "Ghi nhận thanh toán"}
          </Link>
        ) : (
          <Link
            href={`/contracts/new?roomId=${room.id}`}
            className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary text-base font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 active:scale-[0.99]"
          >
            <Plus size={18} className="mr-2" />
            <span>{t("contracts.create")}</span>
          </Link>
        )}
      </div>
    </PageTransition>
  );
}
