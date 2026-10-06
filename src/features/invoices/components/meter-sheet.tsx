"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, Plus, Trash2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/money";
import { useSubmit } from "@/lib/use-submit";
import { saveReadingAndCreateInvoice } from "../actions";
import { calculateInvoice } from "../calculate";
import { type ReadingInput, readingSchema } from "../schemas";

type Props = {
  propertyId: string;
  roomId: string;
  period: string;
  prevElectric: number;
  prevWater: number;
  electricPrice: number;
  waterPrice: number;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string | null;
  defaultServices?: Array<{ id: string; name: string; amount: number; quantity: number }>;
};

export function MeterSheet(props: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<
    Array<{ id: string; name: string; amount: number; quantity: number }>
  >(
    props.defaultServices && props.defaultServices.length > 0
      ? props.defaultServices
      : [
          { id: "srv-trash", name: "Phí rác", amount: 30000, quantity: 1 },
          { id: "srv-wifi", name: "Wi-Fi / Internet", amount: 50000, quantity: 1 },
        ],
  );
  const [electricPhoto, setElectricPhoto] = useState<string | null>(null);
  const [waterPhoto, setWaterPhoto] = useState<string | null>(null);

  const draftKey = `meter-draft:${props.roomId}:${props.period}`;

  const form = useForm<ReadingInput>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      roomId: props.roomId,
      period: props.period,
      electricCurr: props.prevElectric,
      waterCurr: props.prevWater,
      electricReplaced: false,
      waterReplaced: false,
      electricPrev: props.prevElectric,
      waterPrev: props.prevWater,
      electricPhoto: null,
      waterPhoto: null,
      otherFee: 0,
      otherFeeNote: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) form.reset({ ...form.getValues(), ...JSON.parse(raw) });
    } catch {
      /* nháp hỏng thì bỏ qua */
    }
  }, [open, draftKey, form]);

  const v = form.watch();
  useEffect(() => {
    if (!open) return;
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        electricCurr: v.electricCurr,
        waterCurr: v.waterCurr,
        otherFee: v.otherFee,
        otherFeeNote: v.otherFeeNote,
      }),
    );
  }, [open, draftKey, v.electricCurr, v.waterCurr, v.otherFee, v.otherFeeNote]);

  const ePrev = v.electricReplaced ? v.electricPrev : props.prevElectric;
  const wPrev = v.waterReplaced ? v.waterPrev : props.prevWater;
  const eUsage = v.electricCurr - ePrev;
  const wUsage = v.waterCurr - wPrev;
  const invalidReading = eUsage < 0 || wUsage < 0;

  const totalServices = services.reduce((acc, s) => acc + s.amount * s.quantity, 0);

  const preview = useMemo(() => {
    if (invalidReading) return null;
    return calculateInvoice({
      period: props.period,
      monthlyRent: props.monthlyRent,
      contractStart: props.contractStart,
      contractEnd: props.contractEnd,
      electric: { prev: ePrev, curr: v.electricCurr, unitPrice: props.electricPrice },
      water: { prev: wPrev, curr: v.waterCurr, unitPrice: props.waterPrice },
      otherFee: (v.otherFee ?? 0) + totalServices,
    });
  }, [
    invalidReading,
    props.period,
    props.monthlyRent,
    props.contractStart,
    props.contractEnd,
    ePrev,
    v.electricCurr,
    props.electricPrice,
    wPrev,
    v.waterCurr,
    props.waterPrice,
    v.otherFee,
    totalServices,
  ]);

  const { submit, pending, error } = useSubmit(
    async (values: ReadingInput) => {
      return saveReadingAndCreateInvoice(props.propertyId, {
        ...values,
        electricPhoto,
        waterPhoto,
        otherFee: (values.otherFee ?? 0) + totalServices,
        serviceItems: services.map((s) => ({
          name: s.name,
          amount: s.amount * s.quantity,
          quantity: s.quantity,
        })),
      });
    },
    {
      successKey: "invoices.readingSaved",
      onSuccess: (data) => {
        try {
          localStorage.removeItem(draftKey);
        } catch (_) {}
        setOpen(false);
        router.push(`/invoices/${data.invoiceId}`);
      },
    },
  );

  function handlePhotoUpload(type: "electric" | "water", file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (type === "electric") setElectricPhoto(reader.result);
        else setWaterPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function addService() {
    setServices([
      ...services,
      {
        id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "Giữ xe máy",
        amount: 100000,
        quantity: 1,
      },
    ]);
  }

  function removeService(id: string) {
    setServices(services.filter((s) => s.id !== id));
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full text-base font-semibold shadow-xs"
        onClick={() => setOpen(true)}
      >
        <Zap size={18} className="mr-2" />
        <span>{t("invoices.enterReadings")}</span>
      </Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t("invoices.enterReadings")}
        description={t("invoices.readingFor", { period: props.period })}
      >
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4 pb-4">
          {/* Nhập điện */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Zap size={15} className="text-amber-500" />
                <span>Chỉ số Điện (kWh)</span>
              </span>
              <label className="cursor-pointer text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                <Camera size={13} />
                <span>{electricPhoto ? "Đổi ảnh" : "Chụp ảnh công tơ"}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload("electric", e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field id="electricPrev" label={t("invoices.electricPrev")}>
                {(p) => (
                  <Controller
                    control={form.control}
                    name="electricPrev"
                    render={({ field }) => (
                      <NumberInput
                        id={p.id}
                        value={ePrev}
                        onChange={field.onChange}
                        disabled={!v.electricReplaced}
                        suffix={t("units.kwh")}
                      />
                    )}
                  />
                )}
              </Field>

              <Field id="electricCurr" label={t("invoices.electricCurr")}>
                {(p) => (
                  <Controller
                    control={form.control}
                    name="electricCurr"
                    render={({ field }) => (
                      <NumberInput
                        id={p.id}
                        value={field.value}
                        onChange={field.onChange}
                        suffix={t("units.kwh")}
                        autoFocus
                      />
                    )}
                  />
                )}
              </Field>
            </div>

            {electricPhoto ? (
              <div className="flex items-center gap-2 rounded bg-muted/40 p-1.5 text-xs text-muted-foreground">
                <Check size={14} className="text-emerald-600 font-bold" />
                <span>Đã lưu ảnh công tơ điện làm bằng chứng</span>
              </div>
            ) : null}
          </div>

          {/* Nhập nước */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <span className="text-blue-500 font-bold">💧</span>
                <span>Chỉ số Nước (m³)</span>
              </span>
              <label className="cursor-pointer text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                <Camera size={13} />
                <span>{waterPhoto ? "Đổi ảnh" : "Chụp ảnh đồng hồ"}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload("water", e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field id="waterPrev" label={t("invoices.waterPrev")}>
                {(p) => (
                  <Controller
                    control={form.control}
                    name="waterPrev"
                    render={({ field }) => (
                      <NumberInput
                        id={p.id}
                        value={wPrev}
                        onChange={field.onChange}
                        disabled={!v.waterReplaced}
                        suffix={t("units.m3")}
                      />
                    )}
                  />
                )}
              </Field>

              <Field id="waterCurr" label={t("invoices.waterCurr")}>
                {(p) => (
                  <Controller
                    control={form.control}
                    name="waterCurr"
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

            {waterPhoto ? (
              <div className="flex items-center gap-2 rounded bg-muted/40 p-1.5 text-xs text-muted-foreground">
                <Check size={14} className="text-emerald-600 font-bold" />
                <span>Đã lưu ảnh đồng hồ nước làm bằng chứng</span>
              </div>
            ) : null}
          </div>

          {/* Dịch vụ đi kèm */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Dịch vụ & Phí đi kèm</span>
              <button
                type="button"
                onClick={addService}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus size={13} />
                <span>Thêm dịch vụ</span>
              </button>
            </div>

            <div className="space-y-2">
              {services.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Input
                    value={s.name}
                    onChange={(e) => {
                      const upd = [...services];
                      upd[idx].name = e.target.value;
                      setServices(upd);
                    }}
                    placeholder="Tên dịch vụ..."
                    className="text-xs h-9 flex-1"
                  />
                  <Input
                    type="number"
                    value={s.amount}
                    onChange={(e) => {
                      const upd = [...services];
                      upd[idx].amount = Number(e.target.value);
                      setServices(upd);
                    }}
                    className="text-xs h-9 w-24 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeService(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Xem trước tính toán */}
          {preview ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Tiền phòng ({preview.occupiedDays}/{preview.daysInMonth} ngày):
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {formatMoney(preview.roomFee)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Điện ({preview.electricUsage} số):</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatMoney(preview.electricAmount)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Nước ({preview.waterUsage} khối):</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatMoney(preview.waterAmount)}
                </span>
              </div>
              {preview.otherFee > 0 ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Dịch vụ & phí khác:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatMoney(preview.otherFee)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-primary/20 pt-2 text-sm font-bold text-primary">
                <span>Tổng tạm tính:</span>
                <span className="font-mono text-base">{formatMoney(preview.total)}</span>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-base font-semibold"
            disabled={pending || invalidReading}
          >
            {pending ? "Đang lưu..." : t("invoices.saveAndCreate")}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
