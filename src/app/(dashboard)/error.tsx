"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-danger/40 bg-mat px-6 py-12 text-center">
      <p className="text-lg font-semibold">{t("pageTitle")}</p>
      <p className="max-w-md text-sm text-muc-phu">{t("pageDesc")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
