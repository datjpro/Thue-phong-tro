import type * as React from "react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  sign?: boolean;
}

export function MoneyDisplay({ amount, className, ...props }: MoneyDisplayProps) {
  return (
    <span className={cn("tabular-nums font-mono tracking-tight", className)} {...props}>
      {formatMoney(amount)}
    </span>
  );
}
