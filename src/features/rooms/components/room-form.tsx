"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bed, DoorClosed, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { cn } from "@/lib/utils";
import { createRoom } from "../actions";
import { type RoomInput, roomSchema } from "../schemas";

export function RoomForm({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      floor: null,
      area: null,
      rentPrice: 0,
      roomType: "standard",
      bedCount: 4,
    },
  });
  const { submit, pending } = useSubmit((v: RoomInput) => createRoom(propertyId, v), {
    successKey: "rooms.created",
    onSuccess: (d) => router.push(`/contracts/new?roomId=${d.id}`),
  });
  const { errors } = form.formState;
  const currentRoomType = form.watch("roomType");

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      {/* Chọn loại mô hình phòng */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mô hình phòng
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => form.setValue("roomType", "standard")}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
              currentRoomType === "standard"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50",
            )}
          >
            <DoorClosed size={20} />
            <span className="text-xs">Tiêu chuẩn</span>
          </button>
          <button
            type="button"
            onClick={() => form.setValue("roomType", "dormitory")}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
              currentRoomType === "dormitory"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Bed size={20} />
            <span className="text-xs">Ký túc xá (KTX)</span>
          </button>
          <button
            type="button"
            onClick={() => form.setValue("roomType", "sleepbox")}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
              currentRoomType === "sleepbox"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Layers size={20} />
            <span className="text-xs">Sleepbox</span>
          </button>
        </div>
      </div>

      <Field id="name" label={t("rooms.name")} error={errors.name && t("errors.required")}>
        {(p) => (
          <Input
            id={p.id}
            aria-invalid={p.invalid}
            placeholder={
              currentRoomType === "standard"
                ? "Ví dụ: Phòng 101, P.202..."
                : currentRoomType === "dormitory"
                  ? "Ví dụ: KTX Nam 101..."
                  : "Ví dụ: Phòng Sleepbox Tầng 2..."
            }
            {...form.register("name")}
          />
        )}
      </Field>

      {currentRoomType !== "standard" ? (
        <Field
          id="bedCount"
          label={currentRoomType === "sleepbox" ? "Số lượng hộp (Box)" : "Số lượng giường"}
          hint="Hệ thống sẽ tự động khởi tạo danh sách giường/box tương ứng để quản lý theo từng vị trí."
        >
          {(p) => (
            <Controller
              control={form.control}
              name="bedCount"
              render={({ field }) => (
                <NumberInput
                  id={p.id}
                  value={field.value ?? 4}
                  onChange={field.onChange}
                  suffix={currentRoomType === "sleepbox" ? "box" : "giường"}
                />
              )}
            />
          )}
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field id="floor" label={t("rooms.floor")} hint="Dùng để xếp theo tầng">
          {(p) => (
            <Controller
              control={form.control}
              name="floor"
              render={({ field }) => (
                <NumberInput id={p.id} value={field.value ?? null} onChange={field.onChange} />
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
                <NumberInput
                  id={p.id}
                  value={field.value ?? null}
                  onChange={field.onChange}
                  suffix="m²"
                />
              )}
            />
          )}
        </Field>
      </div>

      <Field
        id="rentPrice"
        label={
          currentRoomType === "standard"
            ? t("rooms.rentPrice")
            : "Tổng giá trị cho thuê dự kiến / tháng"
        }
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

      <Button
        type="submit"
        variant="primary"
        className="min-h-11 text-base mt-2"
        disabled={pending}
      >
        {pending ? "Đang tạo..." : t("rooms.create")}
      </Button>
    </form>
  );
}
