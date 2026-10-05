"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { createContract } from "../actions";
import { type ContractInput, contractSchema } from "../schemas";

type Props = {
  propertyId: string;
  today: string;
  rooms: { id: string; name: string; rentPrice: number }[];
  tenants: { id: string; fullName: string }[];
  defaultRoomId?: string;
};

export function ContractForm({ propertyId, today, rooms, tenants, defaultRoomId }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const initialRoom = rooms.find((r) => r.id === defaultRoomId) ?? rooms[0];
  const form = useForm<ContractInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      roomId: initialRoom?.id ?? "",
      tenantIds: [],
      startDate: today,
      rentPrice: initialRoom?.rentPrice ?? 0,
      deposit: 0,
      initialElectric: 0,
      initialWater: 0,
    },
  });
  const { submit, pending, error } = useSubmit(
    (v: ContractInput) => createContract(propertyId, v),
    {
      successKey: "contracts.created",
      onSuccess: () => router.push("/contracts"),
    },
  );
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <Field id="roomId" label={t("contracts.room")} error={errors.roomId && t("errors.required")}>
        {(p) => (
          <Select
            id={p.id}
            {...form.register("roomId", {
              onChange: (e) => {
                const room = rooms.find((r) => r.id === e.target.value);
                if (room) form.setValue("rentPrice", room.rentPrice);
              },
            })}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">{t("contracts.tenants")}</legend>
        <Controller
          control={form.control}
          name="tenantIds"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              {tenants.map((tn) => (
                <label
                  key={tn.id}
                  className="flex min-h-11 items-center gap-3 rounded-control px-2 hover:bg-giay"
                >
                  <input
                    type="checkbox"
                    className="size-5 accent-[var(--color-la)]"
                    checked={field.value.includes(tn.id)}
                    onChange={(e) =>
                      field.onChange(
                        e.target.checked
                          ? [...field.value, tn.id]
                          : field.value.filter((x) => x !== tn.id),
                      )
                    }
                  />
                  {tn.fullName}
                </label>
              ))}
            </div>
          )}
        />
        <p className="mt-1 text-sm text-muc-phu">{t("contracts.tenantsHint")}</p>
        {errors.tenantIds ? (
          <p className="mt-1 text-sm text-danger">{t("contracts.needTenant")}</p>
        ) : null}
      </fieldset>

      <Field id="startDate" label={t("contracts.startDate")}>
        {(p) => <Input id={p.id} type="date" {...form.register("startDate")} />}
      </Field>
      <Field
        id="rentPrice"
        label={t("contracts.rentPrice")}
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
      <Field id="deposit" label={t("contracts.deposit")}>
        {(p) => (
          <Controller
            control={form.control}
            name="deposit"
            render={({ field }) => (
              <NumberInput id={p.id} value={field.value} onChange={field.onChange} suffix="₫" />
            )}
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="initialElectric" label={t("contracts.initialElectric")}>
          {(p) => (
            <Controller
              control={form.control}
              name="initialElectric"
              render={({ field }) => (
                <NumberInput
                  id={p.id}
                  value={field.value}
                  onChange={field.onChange}
                  suffix={t("units.kwh")}
                />
              )}
            />
          )}
        </Field>
        <Field id="initialWater" label={t("contracts.initialWater")}>
          {(p) => (
            <Controller
              control={form.control}
              name="initialWater"
              render={({ field }) => (
                <NumberInput
                  id={p.id}
                  value={field.value}
                  onChange={field.onChange}
                  suffix={t("units.m3")}
                />
              )}
            />
          )}
        </Field>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{t("contracts.initialHint")}</p>

      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        className="min-h-11 text-base mt-2"
        disabled={pending}
      >
        {pending ? "Đang tạo..." : t("contracts.create")}
      </Button>
    </form>
  );
}
