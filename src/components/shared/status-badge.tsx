import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Wrench, XCircle } from "lucide-react";
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
  | "done"
  | "rejected";

const styles: Record<BadgeKind, { tone: string; icon: typeof Clock }> = {
  paid: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  done: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  active: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  occupied: { tone: "text-success border-success/30 bg-success/10", icon: CheckCircle2 },
  unpaid: { tone: "text-nghe border-nghe/30 bg-nghe/10", icon: Clock },
  partial: { tone: "text-nghe border-nghe/30 bg-nghe/10", icon: Clock },
  in_progress: { tone: "text-nghe border-nghe/30 bg-nghe/10", icon: Wrench },
  maintenance: { tone: "text-nghe border-nghe/30 bg-nghe/10", icon: Wrench },
  overdue: {
    tone: "text-danger border-danger/30 bg-danger/10",
    icon: AlertTriangle,
  },
  open: { tone: "text-danger border-danger/30 bg-danger/10", icon: AlertTriangle },
  vacant: { tone: "text-info border-info/30 bg-info/10", icon: CircleDashed },
  ended: { tone: "text-muc-phu border-suong bg-mat", icon: CircleDashed },
  rejected: { tone: "text-muted-foreground border-border bg-muted/50", icon: XCircle },
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
