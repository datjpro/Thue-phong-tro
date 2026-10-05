"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { createRoom } from "../actions";
import { type RoomInput, roomSchema } from "../schemas";

export function RoomForm({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", floor: null, area: null, rentPrice: 0 },
  });
  const { submit, pending } = useSubmit((v: RoomInput) => createRoom(propertyId, v), {
    successKey: "rooms.created",
    // Sau khi tạo phòng, đưa thẳng tới bước tạo hợp đồng (UX-UI 6.3).
    onSuccess: (d) => router.push(`/contracts/new?roomId=${d.id}`),
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex max-w-md flex-col gap-4 rounded-panel border border-suong bg-mat p-4"
    >
      <Field id="name" label={t("rooms.name")} error={errors.name && t("errors.required")}>
        {(p) => <Input id={p.id} aria-invalid={p.invalid} {...form.register("name")} />}
      </Field>
      <Field id="floor" label={t("rooms.floor")}>
        {(p) => (
          <Controller
            control={form.control}
            name="floor"
            render={({ field }) => (
              <NumberInput id={p.id} value={field.value} onChange={field.onChange} />
            )}
          />
        )}
      </Field>
      <Field id="area" label={t("rooms.area")}>
        {(p) => (
          <Controller
            control={form.control}
            name="area"
            render={({ field }) => (
              <NumberInput id={p.id} value={field.value} onChange={field.onChange} suffix="m²" />
            )}
          />
        )}
      </Field>
      <Field
        id="rentPrice"
        label={t("rooms.rentPrice")}
        error={errors.rentPrice && t("errors.required")}
      >
        {(p) => (
          <Controller
            control={form.control}
            name="rentPrice"
            render={({ field }) => (
              <NumberInput
                id={p.id}
                value={field.value}
                onChange={field.onChange}
                suffix="₫"
                invalid={p.invalid}
              />
            )}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {t("rooms.create")}
      </Button>
    </form>
  );
}
