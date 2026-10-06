"use client";

import { useState } from "react";
import { FileCheck, Package, Plus, ShieldAlert, Trash2, Tv, Wrench } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { useSubmit } from "@/lib/use-submit";
import { createRoomAsset, deleteRoomAsset } from "../actions";
import { type AssetInput, assetSchema } from "../schemas";
import type { RoomAssetRow } from "../queries";
import { HandoverSheet } from "./handover-sheet";

interface Props {
  propertyId: string;
  roomId: string;
  roomName: string;
  contractId: string | null;
  tenantName: string | null;
  assets: RoomAssetRow[];
}

export function AssetManager({
  propertyId,
  roomId,
  roomName,
  contractId,
  tenantName,
  assets,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [showHandover, setShowHandover] = useState(false);

  const form = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      roomId,
      name: "",
      category: "furniture",
      quantity: 1,
      condition: "good",
      serialNumber: null,
      notes: null,
    },
  });

  const { submit, pending } = useSubmit((v: AssetInput) => createRoomAsset(propertyId, v), {
    successKey: "Đã thêm trang thiết bị",
    onSuccess: () => {
      form.reset({
        roomId,
        name: "",
        category: "furniture",
        quantity: 1,
        condition: "good",
        serialNumber: null,
        notes: null,
      });
      setShowAdd(false);
    },
  });

  const categoryIcons: Record<string, typeof Package> = {
    electrical: Tv,
    furniture: Package,
    sanitary: Wrench,
    security: ShieldAlert,
    other: Package,
  };

  const conditionBadges: Record<string, { label: string; color: string }> = {
    new: {
      label: "Mới 100%",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    good: { label: "Tốt", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
    fair: {
      label: "Bình thường / Cũ",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    damaged: {
      label: "Hỏng / Cần sửa",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Trang thiết bị & Bàn giao tài sản</h3>
          <p className="text-xs text-muted-foreground">
            Quản lý danh mục thiết bị trong phòng và biên bản nhận/trả phòng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {contractId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHandover(true)}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <FileCheck size={15} />
              <span>Biên bản bàn giao (Check-in/out)</span>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="gap-1.5"
          >
            <Plus size={15} />
            <span>Thêm tài sản</span>
          </Button>
        </div>
      </div>

      {/* Add Asset Form */}
      {showAdd ? (
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field id="name" label="Tên thiết bị (Ví dụ: Máy lạnh Panasonic, Quạt trần...)">
              {(p) => (
                <Input
                  id={p.id}
                  placeholder="Máy lạnh, Tủ lạnh, Nệm..."
                  {...form.register("name")}
                />
              )}
            </Field>

            <Field id="category" label="Phân loại">
              {(p) => (
                <Select id={p.id} {...form.register("category")}>
                  <option value="electrical">Điện máy / Điện tử (Máy lạnh, tủ lạnh...)</option>
                  <option value="furniture">Nội thất (Giường, tủ, bàn ghế...)</option>
                  <option value="sanitary">Thiết bị vệ sinh (Bình nóng lạnh, vòi...)</option>
                  <option value="security">Khóa & An ninh (Khóa thông minh...)</option>
                  <option value="other">Khác</option>
                </Select>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field id="quantity" label="Số lượng">
              {(p) => (
                <Input
                  id={p.id}
                  type="number"
                  min={1}
                  {...form.register("quantity", { valueAsNumber: true })}
                />
              )}
            </Field>

            <Field id="condition" label="Tình trạng hiện tại">
              {(p) => (
                <Select id={p.id} {...form.register("condition")}>
                  <option value="new">Mới 100%</option>
                  <option value="good">Tốt / Đang hoạt động tốt</option>
                  <option value="fair">Bình thường / Đã qua sử dụng</option>
                  <option value="damaged">Hỏng hóc / Cần bảo trì</option>
                </Select>
              )}
            </Field>

            <Field id="serialNumber" label="Số Serial / Mã Model">
              {(p) => (
                <Input id={p.id} placeholder="SN-12345..." {...form.register("serialNumber")} />
              )}
            </Field>
          </div>

          <Field id="notes" label="Ghi chú chi tiết">
            {(p) => (
              <Input
                id={p.id}
                placeholder="Ghi chú thêm về vị trí, tình trạng trầy xước..."
                {...form.register("notes")}
              />
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={pending}>
              {pending ? "Đang lưu..." : "Lưu thiết bị"}
            </Button>
          </div>
        </form>
      ) : null}

      {/* Asset List */}
      {assets.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-3 text-center">
          Chưa có trang thiết bị nào được ghi nhận cho phòng này. Bấm &quot;Thêm tài sản&quot; để
          tạo danh mục.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {assets.map((a) => {
            const Icon = categoryIcons[a.category] || Package;
            const cond = conditionBadges[a.condition] || conditionBadges.good;

            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{a.name}</p>
                      <span className="text-xs text-muted-foreground">x{a.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cond.color}`}
                      >
                        {cond.label}
                      </span>
                      {a.serialNumber ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {a.serialNumber}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Xóa ${a.name}?`)) {
                      await deleteRoomAsset(propertyId, a.id, roomId);
                    }
                  }}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Xóa thiết bị"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Handover Dialog / Sheet */}
      {showHandover && contractId ? (
        <HandoverSheet
          open={showHandover}
          onClose={() => setShowHandover(false)}
          propertyId={propertyId}
          contractId={contractId}
          roomId={roomId}
          roomName={roomName}
          tenantName={tenantName}
          assets={assets}
        />
      ) : null}
    </div>
  );
}
