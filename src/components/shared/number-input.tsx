"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import { formatNumber, parseNumber } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  /** Đơn vị nằm trong ô: ₫, số, khối */
  suffix?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  className?: string;
} & Pick<React.ComponentProps<"input">, "placeholder" | "name">;

/** Ô nhập số nguyên: bàn phím số, tự thêm dấu chấm nghìn, hậu tố đơn vị nằm trong ô. */
export function NumberInput({
  value,
  onChange,
  suffix,
  invalid,
  describedBy,
  className,
  ...props
}: Props) {
  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        autoComplete="off"
        value={value === null ? "" : formatNumber(value)}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn("text-right font-mono tabular-nums", suffix && "pr-14", className)}
        {...props}
      />
      {suffix ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
