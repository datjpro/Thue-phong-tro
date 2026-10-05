import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";

type Row = {
  id: string;
  name: string;
  status: "vacant" | "occupied" | "maintenance";
  tenantName: string | null;
  hasActiveContract: boolean;
  invoice: { total: number; status: "unpaid" | "partial" | "paid"; dueDate: string } | null;
};

/** Một danh sách dùng cho cả 1 phòng lẫn nhiều phòng: 1 phòng chỉ là danh sách có một dòng. */
export function RoomList({ rows, today }: { rows: Row[]; today: string }) {
  const t = useTranslations();
  return (
    <ul className="flex flex-col divide-y divide-suong overflow-hidden rounded-panel border border-suong bg-mat">
      {rows.map((r) => (
        <li key={r.id}>
          <Link
            href={`/rooms/${r.id}`}
            className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-giay"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="truncate text-sm text-muc-phu">{r.tenantName ?? t("rooms.noTenant")}</p>
            </div>
            <StatusBadge kind={r.status} />
            {r.invoice ? (
              <>
                <StatusBadge
                  kind={invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today)}
                />
                <span className="min-w-28 text-right font-medium tabular-nums">
                  {formatMoney(r.invoice.total)}
                </span>
              </>
            ) : r.hasActiveContract ? (
              <span className="rounded-full border border-nghe/60 px-2.5 py-0.5 text-sm text-warning">
                {t("rooms.needReadings")}
              </span>
            ) : null}
            <ChevronRight size={20} className="text-muc-phu" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
