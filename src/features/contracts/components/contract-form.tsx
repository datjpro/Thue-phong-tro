"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { getRoomTypeLabel } from "@/features/rooms/constants";
import { useSubmit } from "@/lib/use-submit";
import { createContract } from "../actions";
import { type ContractInput, contractSchema } from "../schemas";

type Props = {
  propertyId: string;
  today: string;
  rooms: { id: string; name: string; rentPrice: number; roomType?: string }[];
  tenants: { id: string; fullName: string }[];
  beds?: { id: string; roomId: string; name: string; rentPrice: number; status: string }[];
  defaultRoomId?: string;
};

export function ContractForm({
  propertyId,
  today,
  rooms,
  tenants,
  beds = [],
  defaultRoomId,
}: Props) {
  const t = useTranslations();
  const router = useRouter();
  const initialRoom = rooms.find((r) => r.id === defaultRoomId) ?? rooms[0];

  const form = useForm<ContractInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      roomId: initialRoom?.id ?? "",
      bedId: null,
      tenantIds: [],
      startDate: today,
      endDate: "",
      rentPrice: initialRoom?.rentPrice ?? 0,
      deposit: 0,
      billingCycle: 1,
      terms: "",
      initialElectric: 0,
      initialWater: 0,
    },
  });

  const selectedRoomId = form.watch("roomId");
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const availableBeds = beds.filter((b) => b.roomId === selectedRoomId && b.status === "vacant");

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
                if (room) {
                  form.setValue("rentPrice", room.rentPrice);
                  form.setValue("bedId", null);
                }
              },
            })}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.roomType ? `(${getRoomTypeLabel(r.roomType)})` : ""}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {/* Nếu phòng là KTX / Sleepbox thì chọn giường cụ thể */}
      {selectedRoom?.roomType && selectedRoom.roomType !== "standard" ? (
        <Field
          id="bedId"
          label="Chọn vị trí giường / box"
          hint="Phòng này được quản lý theo mô hình KTX/Sleepbox"
        >
          {(p) => (
            <Select
              id={p.id}
              {...form.register("bedId", {
                onChange: (e) => {
                  const b = availableBeds.find((x) => x.id === e.target.value);
                  if (b) form.setValue("rentPrice", b.rentPrice);
                },
              })}
            >
              <option value="">-- Toàn bộ phòng / Chưa chọn giường --</option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.rentPrice.toLocaleString("vi-VN")}₫)
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}

      <fieldset>
        <legend className="mb-1 text-sm font-medium">{t("contracts.tenants")}</legend>
        <Controller
          control={form.control}
          name="tenantIds"
          render={({ field }) => (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border border-border/40 rounded-lg p-2 bg-muted/20">
              {tenants.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">
                  Chưa có người thuê trong hệ thống.
                </p>
              ) : (
                tenants.map((tn) => (
                  <label
                    key={tn.id}
                    className="flex min-h-10 items-center gap-3 rounded px-2 hover:bg-muted text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={field.value.includes(tn.id)}
                      onChange={(e) =>
                        field.onChange(
                          e.target.checked
                            ? [...field.value, tn.id]
                            : field.value.filter((x) => x !== tn.id),
                        )
                      }
                    />
                    <span className="text-foreground font-medium">{tn.fullName}</span>
                  </label>
                ))
              )}
            </div>
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t("contracts.tenantsHint")}</p>
        {errors.tenantIds ? (
          <p className="mt-1 text-xs text-destructive">{t("contracts.needTenant")}</p>
        ) : null}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field id="startDate" label={t("contracts.startDate")}>
          {(p) => <Input id={p.id} type="date" {...form.register("startDate")} />}
        </Field>

        <Field id="endDate" label="Ngày kết thúc dự kiến" hint="Để trống nếu không thời hạn">
          {(p) => <Input id={p.id} type="date" {...form.register("endDate")} />}
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      <Field id="billingCycle" label="Chu kỳ đóng tiền" hint="Số tháng đóng tiền một lần">
        {(p) => (
          <Select id={p.id} {...form.register("billingCycle", { valueAsNumber: true })}>
            <option value={1}>1 tháng / lần (Mặc định)</option>
            <option value={3}>3 tháng / lần (Theo quý)</option>
            <option value={6}>6 tháng / lần (Nửa năm)</option>
            <option value={12}>12 tháng / lần (Theo năm)</option>
          </Select>
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

      <Field id="terms" label="Điều khoản bổ sung" hint="Ghi chú thêm về nội quy, thỏa thuận riêng">
        {(p) => (
          <Input
            id={p.id}
            placeholder="Ví dụ: Giờ giấc tự do, không nuôi thú cưng..."
            {...form.register("terms")}
          />
        )}
      </Field>

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
