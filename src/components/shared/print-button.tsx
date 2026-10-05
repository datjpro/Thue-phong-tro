"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  const t = useTranslations("invoices");
  return (
    <Button variant="secondary" className="no-print" onClick={() => window.print()}>
      <Printer size={20} aria-hidden="true" />
      {t("print")}
    </Button>
  );
}
