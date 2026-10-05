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
  paid: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  done: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  active: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  occupied: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  unpaid: { tone: "text-warning border-warning/30 bg-warning/10", icon: Clock },
  partial: { tone: "text-warning border-warning/30 bg-warning/10", icon: Clock },
  in_progress: { tone: "text-warning border-warning/30 bg-warning/10", icon: Wrench },
  maintenance: { tone: "text-warning border-warning/30 bg-warning/10", icon: Wrench },
  overdue: {
    tone: "text-destructive border-destructive/30 bg-destructive/10",
    icon: AlertTriangle,
  },
  open: { tone: "text-destructive border-destructive/30 bg-destructive/10", icon: AlertTriangle },
  vacant: { tone: "text-info border-info/30 bg-info/10", icon: CircleDashed },
  ended: { tone: "text-muted-foreground border-border/70 bg-muted/40", icon: CircleDashed },
};

/** Một bộ trạng thái dùng thống nhất: luôn có biểu tượng + chữ, không dùng màu một mình. */
export function StatusBadge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const t = useTranslations("status");
  const { tone, icon: Icon } = styles[kind] ?? styles.ended;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium select-none shadow-2xs",
        tone,
        className,
      )}
    >
      <Icon size={14} aria-hidden="true" className="shrink-0" />
      <span>{t(kind)}</span>
    </span>
  );
}
