import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type BadgeKind =
  | "paid"
  | "unpaid"
  | "partial"
  | "overdue"
  | "vacant"
  | "occupied"
  | "maintenance"
  | "active"
  | "ended"
  | "open"
  | "in_progress"
  | "done";

const styles: Record<BadgeKind, { tone: string; icon: typeof Clock }> = {
  paid: { tone: "text-success border-success/40 bg-success/10", icon: CheckCircle2 },
  done: { tone: "text-success border-success/40 bg-success/10", icon: CheckCircle2 },
  active: { tone: "text-success border-success/40 bg-success/10", icon: CheckCircle2 },
  occupied: { tone: "text-success border-success/40 bg-success/10", icon: CheckCircle2 },
  unpaid: { tone: "text-warning border-warning/40 bg-warning/10", icon: Clock },
  partial: { tone: "text-warning border-warning/40 bg-warning/10", icon: Clock },
  in_progress: { tone: "text-warning border-warning/40 bg-warning/10", icon: Wrench },
  overdue: { tone: "text-danger border-danger/40 bg-danger/10", icon: AlertTriangle },
  open: { tone: "text-danger border-danger/40 bg-danger/10", icon: AlertTriangle },
  vacant: { tone: "text-info border-info/40 bg-info/10", icon: CircleDashed },
  maintenance: { tone: "text-warning border-warning/40 bg-warning/10", icon: Wrench },
  ended: { tone: "text-muc-phu border-suong bg-giay", icon: CircleDashed },
};

/** Một bộ trạng thái dùng thống nhất: luôn có biểu tượng + chữ, không dùng màu một mình. */
export function StatusBadge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const t = useTranslations("status");
  const { tone, icon: Icon } = styles[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium",
        tone,
        className,
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {t(kind)}
    </span>
  );
}
