import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { InvoiceSheet } from "@/components/shared/invoice-sheet";
import { PageTransition } from "@/components/shared/page-transition";
import { StatusBadge } from "@/components/shared/status-badge";
import { listInvoices } from "@/features/invoices/queries";
import type { RoomDetail } from "@/features/rooms/queries";
import { currentPeriod, formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { Wrench } from "lucide-react";

interface TenantHomeViewProps {
  propertyId: string;
  detail: RoomDetail;
}

export async function TenantHomeView({ propertyId, detail }: TenantHomeViewProps) {
  const t = await getTranslations();
  const period = currentPeriod();
  const today = todayVn();
  const { room, contract, tenants, monthInvoice, monthReading } = detail;

  const history = (await listInvoices(propertyId)).filter(
    (i) => i.roomId === room.id && i.period !== period,
  );
  const primaryTenant = tenants[0]?.fullName ?? "Người thuê";

  return (
    <PageTransition className="mx-auto max-w-md space-y-8 pb-12 lg:pb-8">
      {/* Top Header: Tiêu đề trang 24/700 + Dòng phụ 14/400 */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-muc">{room.name}</h1>
          <span className="inline-flex items-center rounded-full bg-la/10 px-2.5 py-0.5 text-xs font-semibold text-la">
            Phòng của tôi
          </span>
        </div>
        <p className="text-sm text-muc-phu">
          {primaryTenant} · {contract ? "Hợp đồng đang hiệu lực" : "Đang thuê"}
        </p>
      </header>

      {/* Section 1: Tháng hiện tại - Tờ hóa đơn tháng (Khối nổi duy nhất) */}
      <section aria-labelledby="month-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="month-title" className="text-lg font-semibold text-muc">
            {t("common.month", { value: formatPeriodShort(period) })}
          </h2>
          {monthInvoice ? (
            <Link
              href={`/invoices/${monthInvoice.id}`}
              className="text-xs font-medium text-la hover:underline underline-offset-2"
            >
              Xem chi tiết & in →
            </Link>
          ) : null}
        </div>

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
        ) : (
          <div className="rounded-[4px] border border-dashed border-suong bg-mat/50 p-6 text-center">
            <p className="text-sm font-medium text-muc">{t("invoices.noneTitle")}</p>
            <p className="mt-1 text-xs text-muc-phu">
              Chủ trọ sẽ chốt chỉ số điện nước và phát hành hóa đơn vào ngày chốt định kỳ.
            </p>
          </div>
        )}
      </section>

      {/* Section 2: Hợp đồng thuê (Dòng chữ phẳng, không khung) */}
      {contract ? (
        <section aria-labelledby="contract-title" className="space-y-3">
          <h2 id="contract-title" className="text-lg font-semibold text-muc">
            Thông tin hợp đồng
          </h2>
          <div className="border-t border-suong pt-3 space-y-1">
            <p className="text-base text-muc">
              {contract.endDate ? `Hết hạn ${formatDate(contract.endDate)}` : "Không thời hạn"}
              <span className="text-sm text-muc-phu">
                {" "}
                (Bắt đầu từ {formatDate(contract.startDate)})
              </span>
            </p>
            <p className="text-sm text-muc-phu tabular-nums">
              Tiền phòng {formatMoney(contract.rentPrice)} / tháng · Tiền cọc:{" "}
              {formatMoney(contract.deposit)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Section 3: Lịch sử hóa đơn trước (Danh sách phẳng, phân cách bằng đường kẻ 1px) */}
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

      {/* Quick Action: Báo sự cố / Yêu cầu sửa chữa */}
      <div className="pt-2">
        <Link
          href="/maintenance"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[8px] bg-la text-base font-semibold text-la-tren shadow-xs transition-colors hover:bg-la/90 active:scale-[0.99]"
        >
          <Wrench size={18} />
          <span>Báo hỏng / Yêu cầu sửa chữa</span>
        </Link>
      </div>
    </PageTransition>
  );
}
