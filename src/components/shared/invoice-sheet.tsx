import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/dates";
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
  electricPrev?: number | null;
  electricCurr?: number | null;
  waterUsage: number;
  waterUnitPrice: number;
  waterAmount: number;
  waterPrev?: number | null;
  waterCurr?: number | null;
  otherFee: number;
  otherFeeNote: string | null;
  total: number;
  paidAmount: number;
  dueDate: string;
};

function Line({ label, amount, sub }: { label: string; amount: number; sub?: string }) {
  return (
    <div className="flex items-baseline gap-2 py-2">
      <div className="min-w-0">
        <span className="text-base font-normal text-muc">{label}</span>
        {sub ? <p className="text-xs text-muc-phu mt-0.5">{sub}</p> : null}
      </div>
      <span
        className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-suong"
        aria-hidden="true"
      />
      <span className="text-base font-normal tabular-nums text-muc">{formatMoney(amount)}</span>
    </div>
  );
}

/** "Tờ hóa đơn tháng": Điểm nhấn duy nhất của giao diện (UX-UI 7.1). */
export function InvoiceSheet({ data, today }: { data: InvoiceSheetData; today: string }) {
  const t = useTranslations();
  const paid = data.paidAmount >= data.total;
  const overdue = !paid && data.dueDate < today;
  const stamp = paid
    ? {
        label: t("status.paid"),
        tone: "border-success text-success bg-success/10",
        Icon: CheckCircle2,
      }
    : overdue
      ? {
          label: t("status.overdue"),
          tone: "border-danger text-danger bg-danger/10",
          Icon: AlertTriangle,
        }
      : {
          label: t("invoices.stampUnpaid"),
          tone: "border-nghe text-nghe bg-nghe/10",
          Icon: Clock,
        };

  const hasElectricReadings =
    data.electricPrev !== undefined &&
    data.electricPrev !== null &&
    data.electricCurr !== undefined &&
    data.electricCurr !== null;

  const hasWaterReadings =
    data.waterPrev !== undefined &&
    data.waterPrev !== null &&
    data.waterCurr !== undefined &&
    data.waterCurr !== null;

  const electricSub =
    hasElectricReadings &&
    data.electricPrev !== null &&
    data.electricPrev !== undefined &&
    data.electricCurr !== null &&
    data.electricCurr !== undefined
      ? `Số cũ: ${formatNumber(data.electricPrev)} ➔ Số mới: ${formatNumber(data.electricCurr)} (Dùng: ${formatNumber(data.electricUsage)} ${t("units.kwh")}) × ${formatMoney(data.electricUnitPrice)}`
      : `${formatNumber(data.electricUsage)} ${t("units.kwh")} × ${formatMoney(data.electricUnitPrice)}`;

  const waterSub =
    hasWaterReadings &&
    data.waterPrev !== null &&
    data.waterPrev !== undefined &&
    data.waterCurr !== null &&
    data.waterCurr !== undefined
      ? `Số cũ: ${formatNumber(data.waterPrev)} ➔ Số mới: ${formatNumber(data.waterCurr)} (Dùng: ${formatNumber(data.waterUsage)} ${t("units.m3")}) × ${formatMoney(data.waterUnitPrice)}`
      : `${formatNumber(data.waterUsage)} ${t("units.m3")} × ${formatMoney(data.waterUnitPrice)}`;

  return (
    <article className="invoice-sheet-tear relative w-full rounded-[4px] border border-suong bg-mat p-5 pb-7 select-none print:border-black print:bg-white print:text-black">
      {/* Header phiếu: Mã/kỳ bên trái, Con dấu góc trên bên phải */}
      <div className="flex items-start justify-between pb-3">
        <div>
          <span className="text-xs font-medium text-muc-phu">Phiếu thu tháng</span>
          <p className="text-base font-semibold text-muc">
            {data.period.slice(5, 7)}/{data.period.slice(0, 4)}
          </p>
        </div>
        <div
          className={cn(
            "flex -rotate-[4deg] items-center gap-1.5 rounded-[6px] border-2 px-2.5 py-0.5 text-xs font-bold tracking-tight select-none",
            stamp.tone,
            paid && "animate-stamp",
          )}
        >
          <stamp.Icon size={14} strokeWidth={2} aria-hidden="true" />
          <span>{stamp.label}</span>
        </div>
      </div>

      {/* Danh sách các khoản: Nhãn ……… Số tiền */}
      <div className="space-y-0.5 border-t border-suong/70 pt-2">
        <Line label={t("invoices.roomFee")} amount={data.roomFee} />
        <Line label={t("invoices.electric")} sub={electricSub} amount={data.electricAmount} />
        <Line label={t("invoices.water")} sub={waterSub} amount={data.waterAmount} />
        {data.otherFee > 0 ? (
          <Line label={data.otherFeeNote || t("invoices.otherFee")} amount={data.otherFee} />
        ) : null}
      </div>

      {/* Đường kẻ đôi trước dòng tổng */}
      <div className="mt-3 border-t-2 border-double border-suong pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-muc">{t("invoices.total")}</span>
          <span className="text-[32px] font-bold leading-none tracking-tight text-muc tabular-nums print:text-black">
            {formatMoney(data.total)}
          </span>
        </div>

        {data.paidAmount > 0 && !paid ? (
          <p className="mt-2 text-right text-xs text-muc-phu tabular-nums">
            {t("invoices.paidSoFar", { amount: formatMoney(data.paidAmount) })}
          </p>
        ) : null}

        <p className="mt-2.5 text-xs text-muc-phu">
          {t("invoices.due", { date: formatDate(data.dueDate) })}
        </p>
      </div>
    </article>
  );
}
