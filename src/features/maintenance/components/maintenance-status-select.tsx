"use client";

import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { updateMaintenanceStatus } from "../actions";
import type { MaintenanceStatusInput } from "../schemas";

export function MaintenanceStatusSelect({
  propertyId,
  id,
  status,
}: {
  propertyId: string;
  id: string;
  status: "open" | "in_progress" | "done";
}) {
  const t = useTranslations("status");
  const { submit, pending } = useSubmit(
    (v: MaintenanceStatusInput) => updateMaintenanceStatus(propertyId, v),
    { successKey: "maintenance.updated" },
  );
  return (
    <Select
      aria-label={t("changeStatus")}
      value={status}
      disabled={pending}
      className="w-auto min-w-40"
      onChange={(e) => submit({ id, status: e.target.value as MaintenanceStatusInput["status"] })}
    >
      <option value="open">{t("open")}</option>
      <option value="in_progress">{t("in_progress")}</option>
      <option value="done">{t("done")}</option>
    </Select>
  );
}
