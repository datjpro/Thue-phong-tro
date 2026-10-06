"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { BirthDatePicker } from "@/components/shared/birth-date-picker";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { createTenant } from "../actions";
import { type TenantInput, tenantSchema } from "../schemas";
import { OcrIdScanner, type ScannedCCCDData } from "./ocr-id-scanner";

export function TenantForm({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  const form = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      idNumber: "",
      birthDate: "",
      gender: null,
      hometown: "",
      workplace: "",
      licensePlate: "",
      idCardFrontUrl: null,
      idCardBackUrl: null,
      notes: "",
    },
  });

  const { submit, pending } = useSubmit((v: TenantInput) => createTenant(propertyId, v), {
    successKey: "tenants.created",
    onSuccess: () => form.reset(),
  });
  const { errors } = form.formState;

  function handleOcrComplete(data: ScannedCCCDData) {
    if (data.fullName) form.setValue("fullName", data.fullName);
    if (data.idNumber) form.setValue("idNumber", data.idNumber);
    if (data.birthDate) form.setValue("birthDate", data.birthDate);
    if (data.gender) form.setValue("gender", data.gender);
    if (data.hometown) form.setValue("hometown", data.hometown);
    if (data.idCardFrontUrl) form.setValue("idCardFrontUrl", data.idCardFrontUrl);
  }

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserPlus size={16} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">{t("tenants.add")}</h2>
          <p className="text-xs text-muted-foreground">Hồ sơ khách thuê & Khai báo tạm trú</p>
        </div>
      </div>

      {/* Quét OCR CCCD */}
      <OcrIdScanner onScanComplete={handleOcrComplete} />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field id="birthDate" label="Ngày sinh">
          {(p) => (
            <Controller
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <BirthDatePicker id={p.id} value={field.value} onChange={field.onChange} />
              )}
            />
          )}
        </Field>

        <Field id="gender" label="Giới tính">
          {() => (
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("gender")}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          )}
        </Field>
      </div>

      <Field id="hometown" label="Quê quán / Nơi ĐK thường trú">
        {(p) => (
          <Input
            id={p.id}
            placeholder="Xã/Phường, Quận/Huyện, Tỉnh/TP..."
            {...form.register("hometown")}
          />
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field id="workplace" label="Nơi làm việc / Trường học">
          {(p) => (
            <Input
              id={p.id}
              placeholder="Công ty ABC / ĐH Bách Khoa..."
              {...form.register("workplace")}
            />
          )}
        </Field>

        <Field id="licensePlate" label="Biển số xe">
          {(p) => (
            <Input
              id={p.id}
              placeholder="29B1-123.45 / 59A-678.90..."
              {...form.register("licensePlate")}
            />
          )}
        </Field>
      </div>

      <Field id="notes" label="Ghi chú">
        {(p) => <Input id={p.id} placeholder="Thông tin thêm..." {...form.register("notes")} />}
      </Field>

      <Button type="submit" variant="primary" className="min-h-11 mt-1" disabled={pending}>
        {pending ? "Đang lưu..." : t("tenants.create")}
      </Button>
    </form>
  );
}
