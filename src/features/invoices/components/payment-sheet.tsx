"use client";

import { Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/money";
import { recordPayment, undoPayment } from "../actions";

export function PaymentSheet({
  propertyId,
  invoiceId,
  remaining,
}: {
  propertyId: string;
  invoiceId: string;
  remaining: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining); // mặc định thu đủ phần còn lại
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await recordPayment(propertyId, { invoiceId, amount, method });
      if (!r.ok) {
        setError(t.has(`errors.${r.error}`) ? t(`errors.${r.error}`) : t("errors.generic"));
        return;
      }
      setOpen(false);
      router.refresh();
      toast.success(t("invoices.paymentRecorded"), {
        duration: 8000,
        action: {
          label: t("common.undo"),
          onClick: async () => {
            await undoPayment(propertyId, r.data.paymentId);
            router.refresh();
          },
        },
      });
    });
  }

  return (
    <>
      <Button
        onClick={() => {
          setAmount(remaining);
          setOpen(true);
        }}
        className="w-full sm:w-auto"
      >
        <Banknote size={20} aria-hidden="true" />
        {t("invoices.recordPayment")}
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t("invoices.recordPayment")}
        description={t("invoices.remaining", { amount: formatMoney(remaining) })}
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="amount">{t("invoices.amount")}</Label>
            <NumberInput
              id="amount"
              value={amount}
              onChange={setAmount}
              suffix="₫"
              invalid={Boolean(error)}
              describedBy={error ? "pay-error" : undefined}
            />
          </div>
          <div>
            <Label htmlFor="method">{t("invoices.method")}</Label>
            <Select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as "cash" | "transfer")}
            >
              <option value="cash">{t("invoices.cash")}</option>
              <option value="transfer">{t("invoices.transfer")}</option>
            </Select>
          </div>
          {error ? (
            <p id="pay-error" role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button disabled={pending || amount <= 0} onClick={save}>
            {t("invoices.recordPayment")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
