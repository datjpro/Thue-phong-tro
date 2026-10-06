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
      <Field id="address" label="Địa chỉ khu trọ">
        {(p) => (
          <Input
            id={p.id}
            placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Hà Nội..."
            {...form.register("address")}
          />
        )}
      </Field>

      {/* Thông tin đại diện chủ trọ (Bên A trong hợp đồng) */}
      <div className="pt-3 border-t border-border/60 space-y-3">
        <h4 className="font-bold text-sm text-foreground">
          Thông tin chủ trọ (Đại diện Bên A trong hợp đồng)
        </h4>
        <p className="text-xs text-muted-foreground -mt-1">
          Các thông tin này sẽ tự động điền vào Hợp đồng thuê phòng khi in hoặc xuất bản điện tử.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="ownerName" label="Họ tên chủ nhà">
            {(p) => <Input id={p.id} placeholder="Nguyễn Văn A" {...form.register("ownerName")} />}
          </Field>

          <Field id="ownerBirthDate" label="Ngày sinh">
            {(p) => <Input id={p.id} type="date" {...form.register("ownerBirthDate")} />}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="ownerPhone" label="Số điện thoại">
            {(p) => <Input id={p.id} placeholder="0912345678" {...form.register("ownerPhone")} />}
          </Field>

          <Field id="ownerIdNumber" label="Số CCCD">
            {(p) => (
              <Input id={p.id} placeholder="00109xxxxxxxx" {...form.register("ownerIdNumber")} />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="ownerIdDate" label="Ngày cấp CCCD">
            {(p) => <Input id={p.id} type="date" {...form.register("ownerIdDate")} />}
          </Field>

          <Field id="ownerIdPlace" label="Nơi cấp CCCD">
            {(p) => (
              <Input
                id={p.id}
                placeholder="Cục CS QLHC về TTXH"
                {...form.register("ownerIdPlace")}
              />
            )}
          </Field>
        </div>

        <Field id="ownerHometown" label="Nơi đăng ký HK thường trú">
          {(p) => (
            <Input
              id={p.id}
              placeholder="Xã/Phường, Quận/Huyện, Tỉnh/Thành phố..."
              {...form.register("ownerHometown")}
            />
          )}
        </Field>
      </div>

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
