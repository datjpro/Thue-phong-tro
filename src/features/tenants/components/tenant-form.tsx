"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
      className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserPlus size={16} aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold tracking-tight text-foreground">{t("tenants.add")}</h2>
      </div>

      <Field
        id="fullName"
        label={t("tenants.fullName")}
        error={errors.fullName && t("errors.required")}
      >
        {(p) => (
          <Input
            id={p.id}
            aria-invalid={p.invalid}
            placeholder="Nguyễn Văn A"
            {...form.register("fullName")}
          />
        )}
      </Field>
      <Field id="phone" label={t("tenants.phone")}>
        {(p) => (
          <Input
            id={p.id}
            type="tel"
            inputMode="tel"
            placeholder="0901234567"
            {...form.register("phone")}
          />
        )}
      </Field>
      <Field id="idNumber" label={t("tenants.idNumber")}>
        {(p) => (
          <Input
            id={p.id}
            inputMode="numeric"
            placeholder="12 chữ số CCCD"
            {...form.register("idNumber")}
          />
        )}
      </Field>
      <Button type="submit" variant="primary" className="min-h-11 mt-1" disabled={pending}>
        {pending ? "Đang lưu..." : t("tenants.create")}
      </Button>
    </form>
  );
}
