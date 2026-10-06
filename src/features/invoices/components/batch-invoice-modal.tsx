"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Gauge, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { saveBatchReadingsAndCreateInvoices, type BatchReadingItem } from "../actions";
import type { BatchRoomCandidate } from "../queries";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  period: string;
  candidates: BatchRoomCandidate[];
  electricPrice: number;
  waterPrice: number;
}

export function BatchInvoiceModal({
  open,
  onClose,
  propertyId,
  period,
  candidates,
  electricPrice,
  waterPrice,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<
    Array<{
      roomId: string;
      roomName: string;
      floor: number | null;
      tenantName: string | null;
      rentPrice: number;
      electricPrev: number;
      electricCurr: number;
      waterPrev: number;
      waterCurr: number;
      otherFee: number;
      otherFeeNote: string;
      alreadyInvoiced: boolean;
      selected: boolean;
    }>
  >(() =>
    candidates.map((c) => ({
      roomId: c.roomId,
      roomName: c.roomName,
      floor: c.floor,
      tenantName: c.tenantName,
      rentPrice: c.rentPrice,
      electricPrev: c.electricPrev,
      electricCurr: c.electricPrev, // Mặc định bằng số cũ
      waterPrev: c.waterPrev,
      waterCurr: c.waterPrev, // Mặc định bằng số cũ
      otherFee: 0,
      otherFeeNote: "",
      alreadyInvoiced: c.alreadyInvoiced,
      selected: !c.alreadyInvoiced,
    })),
  );

  const [pending, startTransition] = useTransition();

  if (!open) return null;

  const validCandidates = items.filter((i) => !i.alreadyInvoiced);
  const selectedCount = items.filter((i) => i.selected && !i.alreadyInvoiced).length;

  function updateItem(roomId: string, field: string, val: string | number | boolean) {
    setItems((prev) =>
      prev.map((item) => (item.roomId === roomId ? { ...item, [field]: val } : item)),
    );
  }

  function handleAutoFillUsage(elecUnits = 100, waterUnits = 5) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.alreadyInvoiced) return item;
        return {
          ...item,
          electricCurr: item.electricPrev + elecUnits,
          waterCurr: item.waterPrev + waterUnits,
        };
      }),
    );
    toast.info(`Đã điền tạm +${elecUnits} kWh điện và +${waterUnits} m³ nước`);
  }

  function handleSubmit() {
    const toCreate: BatchReadingItem[] = items
      .filter((i) => i.selected && !i.alreadyInvoiced)
      .map((i) => ({
        roomId: i.roomId,
        electricCurr: Number(i.electricCurr) || 0,
        waterCurr: Number(i.waterCurr) || 0,
        otherFee: Number(i.otherFee) || 0,
        otherFeeNote: i.otherFeeNote || undefined,
      }));

    if (toCreate.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 phòng để tạo hóa đơn");
      return;
    }

    startTransition(async () => {
      const res = await saveBatchReadingsAndCreateInvoices(propertyId, period, toCreate);
      if (!res.ok) {
        toast.error("Có lỗi xảy ra khi tạo hóa đơn hàng loạt");
        return;
      }
      toast.success(`Đã lập thành công ${res.data.createdCount} hóa đơn cho kỳ ${period}!`);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Gauge size={18} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Chốt điện nước & Lập hóa đơn hàng loạt
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Kỳ thanh toán: <span className="font-semibold text-foreground">{period}</span> · Đơn
              giá: Điện {formatMoney(electricPrice)}/kWh · Nước {formatMoney(waterPrice)}/m³
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar helper */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-card px-5 py-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">
              Đã chọn: <span className="font-bold text-primary">{selectedCount}</span> /{" "}
              {validCandidates.length} phòng cần tạo
            </span>
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.map((i) => ({ ...i, selected: !i.alreadyInvoiced })))
              }
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, selected: false })))}
              className="font-medium text-muted-foreground hover:underline cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAutoFillUsage(100, 5)}
              className="h-7 text-xs gap-1"
            >
              <Sparkles size={12} className="text-amber-500" />
              Điền số liệu nhanh
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Không có phòng nào có hợp đồng hiệu lực trong kỳ {period}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 bg-muted/50 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả phòng để lập hóa đơn"
                        checked={selectedCount > 0 && selectedCount === validCandidates.length}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) => ({
                              ...i,
                              selected: !i.alreadyInvoiced ? e.target.checked : false,
                            })),
                          )
                        }
                        className="rounded border-border"
                      />
                    </th>
                    <th className="px-3 py-2.5">Phòng & Khách</th>
                    <th className="px-3 py-2.5">Tiền phòng</th>
                    <th className="px-3 py-2.5">Điện (Cũ → Mới)</th>
                    <th className="px-3 py-2.5">Nước (Cũ → Mới)</th>
                    <th className="px-3 py-2.5">Phí khác</th>
                    <th className="px-3 py-2.5 text-right">Dự tính tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((row) => {
                    const elecUsage = Math.max(0, row.electricCurr - row.electricPrev);
                    const waterUsage = Math.max(0, row.waterCurr - row.waterPrev);
                    const elecMoney = elecUsage * electricPrice;
                    const waterMoney = waterUsage * waterPrice;
                    const estimatedTotal =
                      row.rentPrice + elecMoney + waterMoney + (Number(row.otherFee) || 0);

                    return (
                      <tr
                        key={row.roomId}
                        className={`hover:bg-muted/20 transition-colors ${
                          row.alreadyInvoiced
                            ? "opacity-60 bg-muted/10"
                            : row.selected
                              ? "bg-primary/5"
                              : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-2.5 text-center">
                          {row.alreadyInvoiced ? (
                            <CheckCircle2 size={16} className="mx-auto text-emerald-500" />
                          ) : (
                            <input
                              type="checkbox"
                              aria-label={`Chọn phòng ${row.roomName}`}
                              checked={row.selected}
                              onChange={(e) => updateItem(row.roomId, "selected", e.target.checked)}
                              className="rounded border-border"
                            />
                          )}
                        </td>

                        {/* Room & Tenant */}
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-foreground">{row.roomName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.tenantName ?? "Chưa có tên"}
                            {row.floor ? ` · Tầng ${row.floor}` : ""}
                          </div>
                          {row.alreadyInvoiced ? (
                            <span className="inline-block mt-0.5 rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                              Đã có hóa đơn
                            </span>
                          ) : null}
                        </td>

                        {/* Rent Price */}
                        <td className="px-3 py-2.5 font-mono font-medium text-foreground">
                          {formatMoney(row.rentPrice)}
                        </td>

                        {/* Electricity */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-muted-foreground w-10 text-right">
                              {row.electricPrev}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <Input
                              type="number"
                              disabled={row.alreadyInvoiced}
                              value={row.electricCurr}
                              onChange={(e) =>
                                updateItem(row.roomId, "electricCurr", Number(e.target.value))
                              }
                              className="h-8 w-20 px-2 font-mono text-xs font-semibold"
                            />
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ({elecUsage} kWh)
                            </span>
                          </div>
                        </td>

                        {/* Water */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-muted-foreground w-10 text-right">
                              {row.waterPrev}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <Input
                              type="number"
                              disabled={row.alreadyInvoiced}
                              value={row.waterCurr}
                              onChange={(e) =>
                                updateItem(row.roomId, "waterCurr", Number(e.target.value))
                              }
                              className="h-8 w-20 px-2 font-mono text-xs font-semibold"
                            />
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ({waterUsage} m³)
                            </span>
                          </div>
                        </td>

                        {/* Other Fees */}
                        <td className="px-3 py-2.5">
                          <Input
                            type="number"
                            placeholder="0 ₫"
                            disabled={row.alreadyInvoiced}
                            value={row.otherFee || ""}
                            onChange={(e) =>
                              updateItem(row.roomId, "otherFee", Number(e.target.value))
                            }
                            className="h-8 w-24 px-2 font-mono text-xs"
                          />
                        </td>

                        {/* Total Estimated */}
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                          {formatMoney(estimatedTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-5 py-3.5">
          <div className="text-xs text-muted-foreground">
            Hóa đơn sau khi tạo sẽ tự động tính hạn thanh toán và sẵn sàng gửi cho khách.
          </div>
          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={pending || selectedCount === 0}
              onClick={handleSubmit}
            >
              {pending
                ? "Đang tạo hóa đơn..."
                : `Tạo ${selectedCount} hóa đơn (${formatPeriodShort(period)})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPeriodShort(period: string) {
  const [y, m] = period.split("-");
  return `T${m}/${y}`;
}
