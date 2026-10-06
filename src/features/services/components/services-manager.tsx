"use client";

import {
  Bike,
  Check,
  Edit2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  WashingMachine,
  Wifi,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { createService, deleteService, updateService } from "../actions";
import type { PropertyServiceItem } from "../queries";
import type { ChargeType, ServiceInput } from "../schemas";

interface Props {
  propertyId: string;
  initialServices: PropertyServiceItem[];
}

const PRESET_TEMPLATES = [
  { name: "Phí rác", unitPrice: 30000, chargeType: "fixed_room" as ChargeType, icon: Trash2 },
  {
    name: "Wi-Fi / Internet",
    unitPrice: 50000,
    chargeType: "fixed_room" as ChargeType,
    icon: Wifi,
  },
  { name: "Giữ xe máy", unitPrice: 100000, chargeType: "per_vehicle" as ChargeType, icon: Bike },
  {
    name: "Vệ sinh chung",
    unitPrice: 30000,
    chargeType: "per_person" as ChargeType,
    icon: Sparkles,
  },
  {
    name: "Máy giặt chung",
    unitPrice: 50000,
    chargeType: "per_person" as ChargeType,
    icon: WashingMachine,
  },
];

export function ServicesManager({ propertyId, initialServices }: Props) {
  const [services, setServices] = useState<PropertyServiceItem[]>(initialServices);
  const [isPending, startTransition] = useTransition();

  // Modal create/edit
  const [openModal, setOpenModal] = useState(false);
  const [editingService, setEditingService] = useState<PropertyServiceItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState<number>(30000);
  const [chargeType, setChargeType] = useState<ChargeType>("fixed_room");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState<"yes" | "no">("yes");

  function openCreateModal(preset?: (typeof PRESET_TEMPLATES)[0]) {
    setEditingService(null);
    if (preset) {
      setName(preset.name);
      setUnitPrice(preset.unitPrice);
      setChargeType(preset.chargeType);
    } else {
      setName("");
      setUnitPrice(50000);
      setChargeType("fixed_room");
    }
    setDescription("");
    setIsActive("yes");
    setOpenModal(true);
  }

  function openEditModal(s: PropertyServiceItem) {
    setEditingService(s);
    setName(s.name);
    setUnitPrice(s.unitPrice);
    setChargeType(s.chargeType as ChargeType);
    setDescription(s.description ?? "");
    setIsActive(s.isActive as "yes" | "no");
    setOpenModal(true);
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ");
      return;
    }

    const payload: ServiceInput = {
      name: name.trim(),
      unitPrice,
      chargeType,
      description: description.trim() || null,
      isActive,
    };

    startTransition(async () => {
      if (editingService) {
        const res = await updateService(propertyId, editingService.id, payload);
        if (res.ok) {
          toast.success("Đã cập nhật dịch vụ");
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? { ...s, ...payload } : s)),
          );
          setOpenModal(false);
        } else {
          toast.error("Không thể cập nhật dịch vụ");
        }
      } else {
        const res = await createService(propertyId, payload);
        if (res.ok && res.data) {
          toast.success("Đã thêm dịch vụ mới");
          const newItem: PropertyServiceItem = {
            id: res.data.id,
            propertyId,
            name: payload.name,
            chargeType: payload.chargeType,
            unitPrice: payload.unitPrice,
            description: payload.description ?? null,
            isActive: payload.isActive,
            createdAt: new Date(),
          };
          setServices((prev) => [newItem, ...prev]);
          setOpenModal(false);
        } else {
          toast.error("Không thể tạo dịch vụ");
        }
      }
    });
  }

  function handleDelete(s: PropertyServiceItem) {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${s.name}"?`)) return;

    startTransition(async () => {
      const res = await deleteService(propertyId, s.id);
      if (res.ok) {
        toast.success("Đã xóa dịch vụ");
        setServices((prev) => prev.filter((item) => item.id !== s.id));
      } else {
        toast.error("Không thể xóa dịch vụ");
      }
    });
  }

  function getChargeTypeLabel(ct: string) {
    switch (ct) {
      case "fixed_room":
        return "Theo phòng / tháng";
      case "per_person":
        return "Theo người / tháng";
      case "per_vehicle":
        return "Theo xe máy / tháng";
      case "per_usage":
        return "Theo lần sử dụng";
      default:
        return "Cố định";
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Quick presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h3 className="text-base font-bold text-foreground">Bảng giá Dịch vụ & Phí tiện ích</h3>
          <p className="text-xs text-muted-foreground">
            Các khoản phí cố định tự động đưa vào hóa đơn hàng tháng
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => openCreateModal()}
          className="gap-1.5 shadow-xs"
        >
          <Plus size={15} />
          <span>Thêm dịch vụ</span>
        </Button>
      </div>

      {/* Gợi ý thêm nhanh các dịch vụ phổ biến nếu chưa có */}
      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center space-y-3">
          <p className="text-sm font-medium text-foreground">Chưa có dịch vụ nào được cài đặt.</p>
          <p className="text-xs text-muted-foreground">Thêm nhanh các dịch vụ nhà trọ phổ biến:</p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {PRESET_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => openCreateModal(tpl)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all shadow-2xs"
              >
                <tpl.icon size={14} />
                <span>
                  {tpl.name} ({formatMoney(tpl.unitPrice)})
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((s) => {
            const isInactive = s.isActive === "no";
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3.5 transition-all shadow-2xs",
                  isInactive
                    ? "border-border/40 bg-muted/20 opacity-60"
                    : "border-border/60 bg-card hover:border-primary/40",
                )}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{s.name}</span>
                    {isInactive ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Tạm ngưng
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground font-mono">
                      {formatMoney(s.unitPrice)}
                    </span>
                    <span>·</span>
                    <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px]">
                      {getChargeTypeLabel(s.chargeType)}
                    </span>
                  </div>
                  {s.description ? (
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">
                      {s.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    title="Chỉnh sửa dịch vụ"
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    title="Xóa dịch vụ"
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa dịch vụ */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Chỉnh sửa Dịch vụ" : "Thêm Dịch vụ mới"}</DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập thông tin bảng giá và chu kỳ tính phí dịch vụ cho nhà trọ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div>
              <label
                htmlFor="service-name-input"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Tên dịch vụ <span className="text-destructive">*</span>
              </label>
              <Input
                id="service-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Phí rác, Wi-Fi, Giữ xe máy, Máy giặt..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="service-unit-price-input"
                  className="text-xs font-semibold text-foreground block mb-1"
                >
                  Đơn giá (₫) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="service-unit-price-input"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                  placeholder="30000"
                />
              </div>

              <div>
                <label
                  htmlFor="service-charge-type-select"
                  className="text-xs font-semibold text-foreground block mb-1"
                >
                  Hình thức tính
                </label>
                <select
                  id="service-charge-type-select"
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value as ChargeType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="fixed_room">Theo phòng / tháng</option>
                  <option value="per_person">Theo người / tháng</option>
                  <option value="per_vehicle">Theo xe máy / tháng</option>
                  <option value="per_usage">Theo lần sử dụng</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="service-desc-input"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Ghi chú / Mô tả (tùy chọn)
              </label>
              <Input
                id="service-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết về dịch vụ..."
              />
            </div>

            <div>
              <label
                htmlFor="service-status-select"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Trạng thái sử dụng
              </label>
              <select
                id="service-status-select"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value as "yes" | "no")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="yes">Đang hoạt động (Tự động đưa vào hóa đơn)</option>
                <option value="no">Tạm ngưng</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setOpenModal(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={handleSave}
                className="gap-1"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
