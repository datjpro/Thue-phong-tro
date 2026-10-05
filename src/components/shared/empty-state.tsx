import type * as React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Trạng thái rỗng: nói rõ thiếu gì và đúng một hành động tiếp theo với minh họa sạch. */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = FolderOpen,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-card/60 px-6 py-12 text-center shadow-2xs",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
        <Icon size={24} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
