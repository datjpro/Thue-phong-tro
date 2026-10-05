"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
        <AlertTriangle size={24} aria-hidden="true" />
      </div>
      <p className="text-base font-bold text-foreground">{t("pageTitle")}</p>
      <p className="max-w-md text-xs text-muted-foreground leading-relaxed">{t("pageDesc")}</p>
      <Button variant="primary" className="mt-2" onClick={reset}>
        <RotateCcw size={16} />
        <span>{t("retry")}</span>
      </Button>
    </div>
  );
}
