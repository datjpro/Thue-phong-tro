"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { formatMoney, formatNumber } from "@/lib/money";
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
};

// Ngưỡng cảnh báo mềm, chỉ để nhắc kiểm tra lại, không chặn lưu.
const ELECTRIC_HIGH = 600;
const WATER_HIGH = 60;

export function MeterSheet(props: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
      otherFee: 0,
      otherFeeNote: "",
    },
  });

  // Khôi phục nháp cục bộ khi mở lại (mất mạng / lỡ đóng sheet).
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

  const preview = useMemo(() => {
    if (invalidReading) return null;
    return calculateInvoice({
      period: props.period,
      monthlyRent: props.monthlyRent,
      contractStart: props.contractStart,
      contractEnd: props.contractEnd,
      electric: { prev: ePrev, curr: v.electricCurr, unitPrice: props.electricPrice },
      water: { prev: wPrev, curr: v.waterCurr, unitPrice: props.waterPrice },
      otherFee: v.otherFee,
    });
  }, [invalidReading, props, ePrev, wPrev, v.electricCurr, v.waterCurr, v.otherFee]);

  const { submit, pending, error } = useSubmit(
    (input: ReadingInput) => saveReadingAndCreateInvoice(props.propertyId, input),
    {
      successKey: "invoices.readingSaved",
      onSuccess: (d) => {
        localStorage.removeItem(draftKey);
        setOpen(false);
        router.push(`/invoices/${d.invoiceId}`);
      },
    },
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto" variant="primary">
        <Zap size={18} aria-hidden="true" />
        <span>{t("invoices.enterReadings")}</span>
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t("invoices.enterReadings")}
        description={t("invoices.readingFor", {
          period: props.period.split("-").reverse().join("/"),
        })}
      >
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5 pt-2">
          {/* Điện */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4">
            <Field id="electricPrev" label={t("invoices.electricPrev")}>
              {(p) => (
                <Controller
                  control={form.control}
                  name="electricPrev"
                  render={({ field }) => (
                    <NumberInput
                      id={p.id}
                      value={v.electricReplaced ? field.value : props.prevElectric}
                      onChange={field.onChange}
                      suffix={t("units.kwh")}
                      disabled={!v.electricReplaced}
                    />
                  )}
                />
              )}
            </Field>
            <label className="flex min-h-10 items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                {...form.register("electricReplaced")}
              />
              {t("invoices.replaced")}
            </label>
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
                      invalid={eUsage < 0}
                      autoFocus
                    />
                  )}
                />
              )}
            </Field>
            <p aria-live="polite" className="text-xs text-muted-foreground font-mono">
              {eUsage >= 0
                ? t("invoices.calcLine", {
                    usage: formatNumber(eUsage),
                    unit: t("units.kwh"),
                    price: formatMoney(props.electricPrice),
                    amount: formatMoney(eUsage * props.electricPrice),
                  })
                : null}
            </p>
            {eUsage > ELECTRIC_HIGH ? (
              <p className="text-xs text-warning">{t("invoices.unusualHigh")}</p>
            ) : null}
          </div>

          {/* Nước */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4">
            <Field id="waterPrev" label={t("invoices.waterPrev")}>
              {(p) => (
                <Controller
                  control={form.control}
                  name="waterPrev"
                  render={({ field }) => (
                    <NumberInput
                      id={p.id}
                      value={v.waterReplaced ? field.value : props.prevWater}
                      onChange={field.onChange}
                      suffix={t("units.m3")}
                      disabled={!v.waterReplaced}
                    />
                  )}
                />
              )}
            </Field>
            <label className="flex min-h-10 items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                {...form.register("waterReplaced")}
              />
              {t("invoices.replaced")}
            </label>
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
                      invalid={wUsage < 0}
                    />
                  )}
                />
              )}
            </Field>
            <p aria-live="polite" className="text-xs text-muted-foreground font-mono">
              {wUsage >= 0
                ? t("invoices.calcLine", {
                    usage: formatNumber(wUsage),
                    unit: t("units.m3"),
                    price: formatMoney(props.waterPrice),
                    amount: formatMoney(wUsage * props.waterPrice),
                  })
                : null}
            </p>
            {wUsage > WATER_HIGH ? (
              <p className="text-xs text-warning">{t("invoices.unusualHigh")}</p>
            ) : null}
          </div>

          {invalidReading ? (
            <p role="alert" className="text-xs font-medium text-warning">
              {t("invoices.lowerWarning")}
            </p>
          ) : null}

          {/* Phí khác */}
          <div className="space-y-3">
            <Field id="otherFee" label={t("invoices.otherFee")}>
              {(p) => (
                <Controller
                  control={form.control}
                  name="otherFee"
                  render={({ field }) => (
                    <NumberInput
                      id={p.id}
                      value={field.value}
                      onChange={field.onChange}
                      suffix="₫"
                    />
                  )}
                />
              )}
            </Field>
            {v.otherFee > 0 ? (
              <Field id="otherFeeNote" label={t("invoices.otherFeeNote")}>
                {(p) => <Input id={p.id} {...form.register("otherFeeNote")} />}
              </Field>
            ) : null}
          </div>

          {/* Tổng tạm tính */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">{t("invoices.estimatedTotal")}</p>
            <p className="text-right text-2xl sm:text-3xl font-bold font-mono text-primary tabular-nums">
              {preview ? formatMoney(preview.total) : "—"}
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending || invalidReading}
            className="w-full min-h-12 text-base"
          >
            {t("invoices.saveAndCreate")}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
