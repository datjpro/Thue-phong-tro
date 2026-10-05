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
    <div className="flex items-baseline gap-2 py-2">
      <div className="min-w-0">
        <p className="text-sm sm:text-base font-medium text-foreground">{label}</p>
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </div>
      <span
        className="mb-1.5 min-w-4 flex-1 self-end border-b border-dotted border-border/80"
        aria-hidden="true"
      />
      <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-foreground">
        {formatMoney(amount)}
      </span>
    </div>
  );
}

/** "Tờ hóa đơn tháng": thành phần đặc trưng, được đầu tư thiết kế nhất (UX-UI 7.1). */
export function InvoiceSheet({ data, today }: { data: InvoiceSheetData; today: string }) {
  const t = useTranslations();
  const paid = data.paidAmount >= data.total;
  const overdue = !paid && data.dueDate < today;
  const stamp = paid
    ? {
        label: t("status.paid"),
        tone: "border-success text-success bg-success/15",
        Icon: CheckCircle2,
      }
    : overdue
      ? {
          label: t("status.overdue"),
          tone: "border-destructive text-destructive bg-destructive/15",
          Icon: AlertTriangle,
        }
      : {
          label: t("invoices.stampUnpaid"),
          tone: "border-warning text-warning bg-warning/15",
          Icon: Clock,
        };

  return (
    <article className="relative max-w-md rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm print:border-black print:bg-white print:text-black">
      <header className="mb-4 pr-28">
        <h2 className="text-lg font-bold tracking-tight text-foreground print:text-black">
          {t("invoices.title", { period: formatPeriodShort(data.period) })}
        </h2>
        <p className="text-sm text-muted-foreground print:text-gray-600">
          {data.roomName}
          {data.tenantName ? ` · ${data.tenantName}` : ""}
        </p>
      </header>

      {/* Con dấu trạng thái ở góc tờ hóa đơn */}
      <div
        className={cn(
          "absolute right-4 top-4 flex -rotate-[8deg] items-center gap-1.5 rounded-lg border-2 px-3 py-1 text-xs sm:text-sm font-bold shadow-xs select-none",
          stamp.tone,
          paid && "animate-stamp",
        )}
      >
        <stamp.Icon size={16} aria-hidden="true" />
        <span>{stamp.label}</span>
      </div>

      <div className="space-y-0.5 divide-y divide-border/40">
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
      </div>

      <div className="mt-4 border-t-2 border-border/80 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("invoices.total")}
          </p>
          <p className="text-right text-[28px] sm:text-[34px] font-bold font-mono leading-none tracking-tight text-primary tabular-nums print:text-black">
            {formatMoney(data.total)}
          </p>
        </div>

        {data.paidAmount > 0 && !paid ? (
          <p className="mt-2 text-right text-xs font-mono text-muted-foreground">
            {t("invoices.paidSoFar", { amount: formatMoney(data.paidAmount) })}
          </p>
        ) : null}

        <p className="mt-3 text-xs text-muted-foreground">
          {t("invoices.due", { date: formatDate(data.dueDate) })}
        </p>
      </div>
    </article>
  );
}
