"use client";

import { useState } from "react";
import { Camera, FileCheck, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { todayVn } from "@/lib/dates";
import { useSubmit } from "@/lib/use-submit";
import { saveAssetHandover } from "../actions";
import type { RoomAssetRow } from "../queries";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  contractId: string;
  roomId: string;
  roomName: string;
  tenantName: string | null;
  assets: RoomAssetRow[];
}

export function HandoverSheet({
  open,
  onClose,
  propertyId,
  contractId,
  roomId,
  roomName,
  tenantName,
  assets,
}: Props) {
  const [type, setType] = useState<"checkin" | "checkout">("checkin");
  const [handoverDate, setHandoverDate] = useState(todayVn());
  const [items, setItems] = useState(
    assets.map((a, i) => ({
      id: a.id || `asset-item-${i}`,
      assetName: a.name,
      condition: a.condition,
      quantity: a.quantity,
      notes: a.notes || "",
    })),
  );
  const [generalNotes, setGeneralNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const { submit, pending } = useSubmit(
    () =>
      saveAssetHandover(propertyId, {
        contractId,
        roomId,
        type,
        handoverDate,
        items: items.map(({ assetName, condition, quantity, notes }) => ({
          assetName,
          condition,
          quantity,
          notes,
        })),
        photos,
        notes: generalNotes,
        signedByTenant: "yes",
      }),
    {
      successKey: "Đã lưu biên bản bàn giao thành công",
      onSuccess: () => onClose(),
    },
  );

  if (!open) return null;

  function updateItemCondition(index: number, condition: "new" | "good" | "fair" | "damaged") {
    const updated = [...items];
    updated[index].condition = condition;
    setItems(updated);
  }

  function updateItemNotes(index: number, note: string) {
    const updated = [...items];
    updated[index].notes = note;
    setItems(updated);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="text-primary size-6" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Biên bản bàn giao tài sản</h2>
              <p className="text-xs text-muted-foreground">
                Phòng {roomName} · Khách thuê: {tenantName ?? "Khách"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Configuration: Check-in vs Check-out */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="type" label="Loại biên bản">
            {() => (
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as "checkin" | "checkout")}
              >
                <option value="checkin">Bàn giao nhận phòng (Check-in)</option>
                <option value="checkout">Bàn giao trả phòng (Check-out đối chiếu cọc)</option>
              </Select>
            )}
          </Field>

          <Field id="date" label="Ngày lập biên bản">
            {() => (
              <Input
                type="date"
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
              />
            )}
          </Field>
        </div>

        {/* Item Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Danh mục tài sản kiểm kê & Hiện trạng
          </p>
          <div className="max-h-60 overflow-y-auto divide-y divide-border/40 rounded-lg border border-border/60 bg-muted/20">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">
                    {item.assetName}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (x{item.quantity})
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={item.condition}
                    onChange={(e) =>
                      updateItemCondition(
                        idx,
                        e.target.value as "new" | "good" | "fair" | "damaged",
                      )
                    }
                    className="text-xs h-8"
                  >
                    <option value="new">Mới</option>
                    <option value="good">Tốt</option>
                    <option value="fair">Bình thường/Cũ</option>
                    <option value="damaged">Hỏng</option>
                  </Select>
                  <Input
                    placeholder="Ghi chú hiện trạng..."
                    value={item.notes}
                    onChange={(e) => updateItemNotes(idx, e.target.value)}
                    className="text-xs h-8 sm:w-44"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ảnh chụp hiện trường làm bằng chứng đối chiếu
            </p>
            <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
              <Camera size={14} />
              <span>Chụp / Tải ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {photos.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {photos.map((src, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: order is local transient list
                  key={`photo-${i}`}
                  className="relative size-16 rounded-lg overflow-hidden border border-border/80"
                >
                  {/* biome-ignore lint/performance/noImgElement: Data URL preview */}
                  <img src={src} alt="Evidence" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/70 p-0.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Chưa có ảnh đính kèm.</p>
          )}
        </div>

        <Field id="notes" label="Ghi chú chung & Thỏa thuận trừ/hoàn cọc">
          {() => (
            <Input
              placeholder="Ví dụ: Đã kiểm tra đầy đủ, phòng sạch sẽ, hoàn cọc 100%..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          )}
        </Field>

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer size={15} />
            <span>In biên bản</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button type="button" variant="primary" size="sm" disabled={pending} onClick={submit}>
              {pending ? "Đang lưu..." : "Lưu biên bản bàn giao"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
