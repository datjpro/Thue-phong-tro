"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/i18n/actions";

export function LocaleToggle({ current }: { current: "vi" | "en" }) {
  const t = useTranslations("settings");
  return (
    <fieldset className="flex gap-2 border-0 m-0 p-0" aria-label={t("language")}>
      {(["vi", "en"] as const).map((l) => (
        <Button
          key={l}
          size="sm"
          variant={current === l ? "primary" : "outline"}
          aria-pressed={current === l}
          onClick={() => setLocale(l)}
        >
          {l === "vi" ? "Tiếng Việt" : "English"}
        </Button>
      ))}
    </fieldset>
  );
}
