import Link from "next/link";
import { type LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "warning" | "destructive" | "default";

const toneStyles: Record<
  StatTone,
  {
    iconWrapper: string;
    value: string;
    borderHover: string;
  }
> = {
  primary: {
    iconWrapper: "bg-primary/15 text-primary",
    value: "text-primary",
    borderHover: "hover:border-primary/40",
  },
  warning: {
    iconWrapper: "bg-warning/15 text-warning",
    value: "text-warning",
    borderHover: "hover:border-warning/40",
  },
  destructive: {
    iconWrapper: "bg-destructive/15 text-destructive",
    value: "text-destructive",
    borderHover: "hover:border-destructive/40",
  },
  default: {
    iconWrapper: "bg-muted text-muted-foreground",
    value: "text-foreground",
    borderHover: "hover:border-border",
  },
};

export interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: StatTone;
  href?: string;
  description?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  href,
  description,
  className,
}: StatsCardProps) {
  const styles = toneStyles[tone];

  const content = (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm transition-all duration-150 select-none",
        href && "cursor-pointer hover:bg-card/90 hover:scale-[1.01] active:scale-[0.99] group",
        href && styles.borderHover,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {label}
        </span>
        <div
          className={cn(
            "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
            styles.iconWrapper,
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums",
            styles.value,
          )}
        >
          {value}
        </span>
        {href ? (
          <ArrowUpRight
            className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {description ? (
        <p className="mt-1 text-xs text-muted-foreground truncate">{description}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
