"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  const t = useTranslations("invoices");
  return (
    <Button variant="outline" size="sm" className="no-print gap-1.5" onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" />
      <span>{t("print")}</span>
    </Button>
  );
}
