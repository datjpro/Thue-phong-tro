"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { updateProperty } from "../actions";
import { type PropertySettingsInput, propertySettingsSchema } from "../schemas";

export function SettingsForm({
  propertyId,
  defaults,
}: {
  propertyId: string;
  defaults: PropertySettingsInput;
}) {
  const t = useTranslations();
  const form = useForm<PropertySettingsInput>({
    resolver: zodResolver(propertySettingsSchema),
    defaultValues: defaults,
  });
  const { submit, pending } = useSubmit(
    (v: PropertySettingsInput) => updateProperty(propertyId, v),
    {
      successKey: "settings.saved",
    },
  );
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <Field
        id="name"
        label={t("settings.propertyName")}
        error={errors.name && t("errors.required")}
      >
        {(p) => <Input id={p.id} aria-invalid={p.invalid} {...form.register("name")} />}
      </Field>
      <Field
        id="electricPrice"
        label={t("settings.electricPrice")}
        error={errors.electricPrice && t("errors.invalidInput")}
      >
        {(p) => (
          <Controller
            control={form.control}
            name="electricPrice"
            render={({ field }) => (
              <NumberInput
                id={p.id}
                value={field.value}
                onChange={field.onChange}
                suffix="₫/số"
                invalid={p.invalid}
              />
            )}
          />
        )}
      </Field>
      <Field
        id="waterPrice"
        label={t("settings.waterPrice")}
        error={errors.waterPrice && t("errors.invalidInput")}
      >
        {(p) => (
          <Controller
            control={form.control}
            name="waterPrice"
            render={({ field }) => (
              <NumberInput
                id={p.id}
                value={field.value}
                onChange={field.onChange}
                suffix="₫/khối"
                invalid={p.invalid}
              />
            )}
          />
        )}
      </Field>
      <Field
        id="dueDay"
        label={t("settings.dueDay")}
        hint={t("settings.dueDayHint")}
        error={errors.dueDay && t("errors.invalidInput")}
      >
        {(p) => (
          <Controller
            control={form.control}
            name="dueDay"
            render={({ field }) => (
              <NumberInput
                id={p.id}
                value={field.value}
                onChange={field.onChange}
                invalid={p.invalid}
                describedBy={p.describedBy}
              />
            )}
          />
        )}
      </Field>
      <Button
        type="submit"
        variant="primary"
        className="min-h-11 text-base mt-2"
        disabled={pending}
      >
        {pending ? "Đang lưu..." : t("settings.save")}
      </Button>
    </form>
  );
}
