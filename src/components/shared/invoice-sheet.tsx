import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate, formatPeriodShort } from "@/lib/dates";
import { formatMoney, formatNumber } from "@/lib/money";
import { cn } from "@/lib/utils";

export type InvoiceSheetData = {
  period: string;
  roomName: string;
  tenantName: string | null;
  roomFee: number;
  electricUsage: number;
  electricUnitPrice: number;
  electricAmount: number;
  waterUsage: number;
  waterUnitPrice: number;
  waterAmount: number;
  otherFee: number;
  otherFeeNote: string | null;
  total: number;
  paidAmount: number;
  dueDate: string;
};

function Line({ label, amount, sub }: { label: string; amount: number; sub?: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <div className="min-w-0">
        <p>{label}</p>
        {sub ? <p className="text-sm text-muc-phu">{sub}</p> : null}
      </div>
      <span
        className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-suong"
        aria-hidden="true"
      />
      <span className="font-medium tabular-nums">{formatMoney(amount)}</span>
    </div>
  );
}

/** "Tờ hóa đơn tháng": thành phần đặc trưng, được phép có chi tiết trang trí (UX-UI 7.1). */
export function InvoiceSheet({ data, today }: { data: InvoiceSheetData; today: string }) {
  const t = useTranslations();
  const paid = data.paidAmount >= data.total;
  const overdue = !paid && data.dueDate < today;
  const stamp = paid
    ? { label: t("status.paid"), tone: "border-success text-success", Icon: CheckCircle2 }
    : overdue
      ? { label: t("status.overdue"), tone: "border-danger text-danger", Icon: AlertTriangle }
      : { label: t("invoices.stampUnpaid"), tone: "border-nghe text-warning", Icon: Clock };

  return (
    <article className="relative max-w-md rounded-sheet border border-suong bg-mat p-5 print:border-black">
      <header className="mb-3 pr-28">
        <h2 className="text-lg font-semibold">
          {t("invoices.title", { period: formatPeriodShort(data.period) })}
        </h2>
        <p className="text-sm text-muc-phu">
          {data.roomName}
          {data.tenantName ? ` · ${data.tenantName}` : ""}
        </p>
      </header>

      <div
        className={cn(
          "absolute right-4 top-4 flex -rotate-[8deg] items-center gap-1 rounded-sheet border-2 px-2 py-1 text-sm font-bold",
          stamp.tone,
          paid && "animate-stamp",
        )}
      >
        <stamp.Icon size={16} aria-hidden="true" />
        {stamp.label}
      </div>

      <Line label={t("invoices.roomFee")} amount={data.roomFee} />
      <Line
        label={t("invoices.electric")}
        sub={`${formatNumber(data.electricUsage)} ${t("units.kwh")} × ${formatMoney(data.electricUnitPrice)}`}
        amount={data.electricAmount}
      />
      <Line
        label={t("invoices.water")}
        sub={`${formatNumber(data.waterUsage)} ${t("units.m3")} × ${formatMoney(data.waterUnitPrice)}`}
        amount={data.waterAmount}
      />
      {data.otherFee > 0 ? (
        <Line label={data.otherFeeNote || t("invoices.otherFee")} amount={data.otherFee} />
      ) : null}

      <div className="mt-2 border-t-2 border-muc pt-3">
        <p className="text-sm text-muc-phu">{t("invoices.total")}</p>
        <p className="text-right text-[32px] font-bold leading-10 tabular-nums">
          {formatMoney(data.total)}
        </p>
        {data.paidAmount > 0 && !paid ? (
          <p className="mt-1 text-right text-sm text-muc-phu">
            {t("invoices.paidSoFar", { amount: formatMoney(data.paidAmount) })}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muc-phu">
          {t("invoices.due", { date: formatDate(data.dueDate) })}
        </p>
      </div>
    </article>
  );
}
