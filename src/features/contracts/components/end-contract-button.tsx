"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useSubmit } from "@/lib/use-submit";
import { endContract } from "../actions";
import type { EndContractInput } from "../schemas";

export function EndContractButton({
  propertyId,
  contractId,
  today,
}: {
  propertyId: string;
  contractId: string;
  today: string;
}) {
  const t = useTranslations("contracts");
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState(today);
  const { submit, pending, error } = useSubmit(
    (v: EndContractInput) => endContract(propertyId, v),
    { successKey: "contracts.ended", onSuccess: () => setOpen(false) },
  );

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {t("end")}
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title={t("end")} description={t("endWarning")}>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="endDate">{t("endDate")}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => submit({ contractId, endDate })}
          >
            {t("endConfirm")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
