import type * as React from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full min-h-12 rounded-lg border border-border/80 bg-card px-3 text-base text-foreground placeholder:text-muted-foreground/70 disabled:bg-muted/40 disabled:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary aria-[invalid=true]:border-destructive transition-colors";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-24 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(field, className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor được truyền từ nơi dùng qua props
  return <label className={cn("mb-1 block text-sm font-medium", className)} {...props} />;
}
