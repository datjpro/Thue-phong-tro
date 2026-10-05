"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FontSize = "sm" | "base" | "lg";

const options: { value: FontSize; label: string; sub: string; iconSize: string }[] = [
  { value: "sm", label: "Nhỏ", sub: "14px", iconSize: "text-xs font-medium" },
  { value: "base", label: "Tiêu chuẩn", sub: "16px", iconSize: "text-sm font-semibold" },
  { value: "lg", label: "Lớn", sub: "18px", iconSize: "text-base font-bold" },
];

export function FontSizeSelector({ className }: { className?: string }) {
  const [current, setCurrent] = useState<FontSize>("base");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("font_size") as FontSize) || "base";
      if (["sm", "base", "lg"].includes(saved)) {
        setCurrent(saved);
        document.documentElement.dataset.fontSize = saved;
      }
    } catch (_) {}
  }, []);

  function setSize(size: FontSize) {
    setCurrent(size);
    try {
      document.documentElement.dataset.fontSize = size;
      localStorage.setItem("font_size", size);
    } catch (_) {}
  }

  return (
    <div className={cn("space-y-2 select-none", className)}>
      <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-giay p-1 border border-suong">
        {options.map(({ value, label, sub, iconSize }) => {
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSize(value)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all text-center",
                active
                  ? "bg-mat text-la font-semibold shadow-xs border border-suong/60"
                  : "text-muc-phu hover:text-muc hover:bg-mat/40",
              )}
            >
              <span className={cn("leading-none", iconSize)}>A</span>
              <span className="text-xs mt-1 font-medium">{label}</span>
              <span className="text-[10px] text-muc-phu tabular-nums">{sub}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muc-phu">
        Cỡ chữ lớn giúp chủ trọ dễ đọc số tiền và chỉ số điện nước hơn trên điện thoại.
      </p>
    </div>
  );
}
