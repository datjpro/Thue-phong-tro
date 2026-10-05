import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { EndContractButton } from "@/features/contracts/components/end-contract-button";
import { MeterSheet } from "@/features/invoices/components/meter-sheet";
import { listInvoices } from "@/features/invoices/queries";
import { getRoomDetail } from "@/features/rooms/queries";
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
  const { room, property, contract, tenants, lastReading, monthInvoice } = detail;

  const history = (await listInvoices(propertyId)).filter(
    (i) => i.roomId === id && i.period !== period,
  );
  const primaryTenant = tenants[0]?.fullName ?? null;

  return (
    <PageTransition className="mx-auto max-w-md space-y-8 pb-12 lg:pb-8">
      {/* Top Header: Tiêu đề trang 24/700 + Dòng phụ 14/400 */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-muc">{room.name}</h1>
          {contract ? (
            <EndContractButton propertyId={propertyId} contractId={contract.id} today={today} />
          ) : (
            <Link
              href={`/contracts/new?roomId=${room.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-suong bg-mat px-3 text-xs font-medium text-muc transition-colors hover:bg-giay"
            >
              <Plus size={14} />
              <span>{t("contracts.create")}</span>
            </Link>
          )}
        </div>
        <p className="text-sm text-muc-phu">
          {primaryTenant ? `${primaryTenant} · đang thuê` : "Chưa có người thuê · Còn trống"}
        </p>
      </header>

      {/* Section 1: Tháng hiện tại - Tờ hóa đơn tháng (Khối nổi duy nhất) */}
      <section aria-labelledby="month-title" className="space-y-3">
        <h2 id="month-title" className="text-lg font-semibold text-muc">
          {t("common.month", { value: formatPeriodShort(period) })}
        </h2>

        {monthInvoice ? (
          <InvoiceSheet
            today={today}
            data={{ ...monthInvoice, roomName: room.name, tenantName: primaryTenant }}
          />
        ) : contract && property ? (
          <div className="rounded-[4px] border border-dashed border-suong bg-mat/50 p-6 text-center">
            <p className="text-sm font-medium text-muc">{t("invoices.noneTitle")}</p>
            <p className="mt-1 text-xs text-muc-phu">{t("invoices.noneDesc")}</p>
          </div>
        ) : (
          <div className="rounded-[4px] border border-dashed border-suong bg-mat/50 p-6 text-center">
            <p className="text-sm font-medium text-muc">{t("rooms.noContractTitle")}</p>
            <p className="mt-1 text-xs text-muc-phu">{t("rooms.noContractDesc")}</p>
          </div>
        )}
      </section>

      {/* Section 2: Hợp đồng (Dòng chữ phẳng, không khung) */}
      {contract ? (
        <section aria-labelledby="contract-title" className="space-y-3">
          <h2 id="contract-title" className="text-lg font-semibold text-muc">
            {t("nav.contracts")}
          </h2>
          <div className="border-t border-suong pt-3 space-y-1">
            <p className="text-base text-muc">
              {contract.endDate ? `Hết hạn ${formatDate(contract.endDate)}` : "Không thời hạn"}
            </p>
            <p className="text-sm text-muc-phu tabular-nums">
              Giá thuê {formatMoney(contract.rentPrice)} / tháng · Cọc{" "}
              {formatMoney(contract.deposit)}
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

      {/* Section 3: Lịch sử hóa đơn (Danh sách phẳng, phân cách bằng đường kẻ 1px) */}
      {history.length > 0 ? (
        <section aria-labelledby="history-title" className="space-y-3">
          <h2 id="history-title" className="text-lg font-semibold text-muc">
            {t("rooms.history")}
          </h2>
          <div className="divide-y divide-suong border-t border-b border-suong">
            {history.map((i) => {
              const monthNum = Number(i.period.split("-")[1]);
              return (
                <Link
                  key={i.id}
                  href={`/invoices/${i.id}`}
                  className="flex h-12 items-center justify-between text-base text-muc transition-colors hover:text-la"
                >
                  <span className="font-normal text-muc">Tháng {monthNum}</span>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums font-normal text-muc">
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

      {/* Nút hành động chính (52px, màu Lá đặc, đặt ngay phía trên thanh dưới) */}
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
          />
        ) : monthInvoice ? (
          <Link
            href={`/invoices/${monthInvoice.id}`}
            className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-la text-base font-semibold text-la-tren shadow-xs transition-colors hover:bg-la/90 active:scale-[0.99]"
          >
            {monthInvoice.paidAmount >= monthInvoice.total
              ? "Xem chi tiết hóa đơn"
              : "Ghi nhận thanh toán"}
          </Link>
        ) : (
          <Link
            href={`/contracts/new?roomId=${room.id}`}
            className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-la text-base font-semibold text-la-tren shadow-xs transition-colors hover:bg-la/90 active:scale-[0.99]"
          >
            <Plus size={18} className="mr-2" />
            <span>{t("contracts.create")}</span>
          </Link>
        )}
      </div>
    </PageTransition>
  );
}
