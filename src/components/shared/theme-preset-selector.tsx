"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ThemePreset = "ocean" | "emerald" | "indigo" | "amber" | "slate";

const PRESETS: Array<{
  id: ThemePreset;
  label: string;
  color: string;
  bgPreview: string;
}> = [
  {
    id: "ocean",
    label: "Xanh Đại Dương",
    color: "#2563EB",
    bgPreview: "bg-blue-600",
  },
  {
    id: "emerald",
    label: "Xanh Ngọc Bảo",
    color: "#059669",
    bgPreview: "bg-emerald-600",
  },
  {
    id: "indigo",
    label: "Tím Than Pro",
    color: "#4F46E5",
    bgPreview: "bg-indigo-600",
  },
  {
    id: "amber",
    label: "Hổ Phách Ấm",
    color: "#D97706",
    bgPreview: "bg-amber-600",
  },
  {
    id: "slate",
    label: "Xám Tối Giản",
    color: "#475569",
    bgPreview: "bg-slate-600",
  },
];

export function ThemePresetSelector({ className = "" }: { className?: string }) {
  const [currentPreset, setCurrentPreset] = useState<ThemePreset>("ocean");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme_preset") as ThemePreset | null;
      if (saved && PRESETS.some((p) => p.id === saved)) {
        setCurrentPreset(saved);
      }
    } catch (_) {}
  }, []);

  function handleSelect(preset: ThemePreset) {
    setCurrentPreset(preset);
    try {
      document.documentElement.dataset.themePreset = preset;
      localStorage.setItem("theme_preset", preset);
    } catch (_) {}
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const isSelected = currentPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border p-2 text-left text-xs font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                  : "border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full text-white shadow-2xs",
                  p.bgPreview,
                )}
              >
                {isSelected ? <Check size={10} strokeWidth={3} /> : null}
              </span>
              <span className="truncate">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
