"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useSubmit } from "@/lib/use-submit";
import { createMaintenance } from "../actions";
import { type MaintenanceInput, maintenanceSchema } from "../schemas";

export function MaintenanceForm({
  propertyId,
  rooms,
}: {
  propertyId: string;
  rooms: { id: string; name: string }[];
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const form = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { roomId: rooms[0]?.id ?? "", title: "", description: "" },
  });
  const { submit, pending } = useSubmit((v: MaintenanceInput) => createMaintenance(propertyId, v), {
    successKey: "maintenance.created",
    onSuccess: () => {
      form.reset({ roomId: rooms[0]?.id ?? "", title: "", description: "" });
      setOpen(false);
    },
  });
  const { errors } = form.formState;

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={rooms.length === 0}>
        <Plus size={20} aria-hidden="true" />
        {t("maintenance.add")}
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title={t("maintenance.add")}>
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
          <Field id="roomId" label={t("contracts.room")}>
            {(p) => (
              <Select id={p.id} {...form.register("roomId")}>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            id="title"
            label={t("maintenance.titleLabel")}
            error={errors.title && t("errors.required")}
          >
            {(p) => <Input id={p.id} aria-invalid={p.invalid} {...form.register("title")} />}
          </Field>
          <Field id="description" label={t("maintenance.description")}>
            {(p) => <Textarea id={p.id} {...form.register("description")} />}
          </Field>
          <Button type="submit" disabled={pending}>
            {t("maintenance.create")}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
