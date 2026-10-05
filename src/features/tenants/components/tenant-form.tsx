"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { createTenant } from "../actions";
import { type TenantInput, tenantSchema } from "../schemas";

export function TenantForm({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  const form = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { fullName: "", phone: "", idNumber: "" },
  });
  const { submit, pending } = useSubmit((v: TenantInput) => createTenant(propertyId, v), {
    successKey: "tenants.created",
    onSuccess: () => form.reset(),
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex flex-col gap-4 rounded-panel border border-suong bg-mat p-4"
    >
      <h2 className="text-lg font-semibold">{t("tenants.add")}</h2>
      <Field
        id="fullName"
        label={t("tenants.fullName")}
        error={errors.fullName && t("errors.required")}
      >
        {(p) => <Input id={p.id} aria-invalid={p.invalid} {...form.register("fullName")} />}
      </Field>
      <Field id="phone" label={t("tenants.phone")}>
        {(p) => <Input id={p.id} type="tel" inputMode="tel" {...form.register("phone")} />}
      </Field>
      <Field id="idNumber" label={t("tenants.idNumber")}>
        {(p) => <Input id={p.id} inputMode="numeric" {...form.register("idNumber")} />}
      </Field>
      <Button type="submit" disabled={pending}>
        {t("tenants.create")}
      </Button>
    </form>
  );
}
