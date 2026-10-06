"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AppWindow,
  Building,
  Check,
  DoorClosed,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  SunMedium,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { NumberInput } from "@/components/shared/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmit } from "@/lib/use-submit";
import { cn } from "@/lib/utils";
import { createRoom } from "../actions";
import { PREDEFINED_ROOM_ASSETS, ROOM_TYPES } from "../constants";
import { type RoomInput, roomSchema } from "../schemas";

interface ExistingRoom {
  id: string;
  name: string;
  floor: number | null;
}

interface Props {
  propertyId: string;
  existingRooms?: ExistingRoom[];
}

export function RoomForm({ propertyId, existingRooms = [] }: Props) {
  const t = useTranslations();
  const router = useRouter();

  // State hỗ trợ tạo tên phòng tự động từ Tầng + Số phòng
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [roomOrder, setRoomOrder] = useState<string>("01");
  const [isCustomName, setIsCustomName] = useState(false);

  // State quản lý danh sách thiết bị đã chọn (name -> { category, quantity })
  const [selectedAssetsMap, setSelectedAssetsMap] = useState<
    Record<
      string,
      { category: "electrical" | "furniture" | "sanitary" | "security" | "other"; quantity: number }
    >
  >({});

  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "101",
      floor: 1,
      area: 25,
      rentPrice: 3500000,
      roomType: "standard",
      selectedAssets: [],
    },
  });

  // Tự động sinh tên phòng khi thay đổi tầng hoặc số thứ tự phòng (nếu người dùng chưa tự sửa thủ công)
  useEffect(() => {
    if (!isCustomName) {
      const padNum = roomOrder.trim().padStart(2, "0");
      let generatedName = "";
      if (selectedFloor === 0) {
        generatedName = `P.${padNum}`;
      } else {
        generatedName = `${selectedFloor}${padNum}`;
      }
      form.setValue("name", generatedName, { shouldValidate: true });
      form.setValue("floor", selectedFloor);
    }
  }, [selectedFloor, roomOrder, isCustomName, form]);

  const currentRoomName = form.watch("name");
  const currentRoomType = form.watch("roomType");

  // Kiểm tra trùng tên phòng trong nhà trọ
  const isDuplicateName = useMemo(() => {
    if (!currentRoomName) return false;
    const cleanCurrent = currentRoomName.trim().toLowerCase();
    return existingRooms.some((r) => r.name.trim().toLowerCase() === cleanCurrent);
  }, [currentRoomName, existingRooms]);

  // Các phòng đã có ở tầng hiện tại
  const roomsOnCurrentFloor = useMemo(() => {
    return existingRooms.filter((r) => r.floor === selectedFloor);
  }, [existingRooms, selectedFloor]);

  // Xử lý chọn / bỏ chọn thiết bị
  function toggleAsset(
    name: string,
    category: "electrical" | "furniture" | "sanitary" | "security" | "other",
    defaultQty = 1,
  ) {
    setSelectedAssetsMap((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = { category, quantity: defaultQty };
      }
      return next;
    });
  }

  // Tăng/giảm số lượng thiết bị
  function updateAssetQty(name: string, delta: number) {
    setSelectedAssetsMap((prev) => {
      if (!prev[name]) return prev;
      const current = prev[name].quantity;
      const nextQty = Math.max(1, current + delta);
      return {
        ...prev,
        [name]: { ...prev[name], quantity: nextQty },
      };
    });
  }

  // Chọn bộ nội thất cơ bản (phổ biến)
  function handleSelectBasicAssets() {
    const map: typeof selectedAssetsMap = {};
    PREDEFINED_ROOM_ASSETS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.isPopular) {
          map[item.name] = {
            category: item.category,
            quantity: item.defaultQuantity,
          };
        }
      });
    });
    setSelectedAssetsMap(map);
  }

  // Chọn toàn bộ nội thất (Full)
  function handleSelectFullAssets() {
    const map: typeof selectedAssetsMap = {};
    PREDEFINED_ROOM_ASSETS.forEach((group) => {
      group.items.forEach((item) => {
        map[item.name] = {
          category: item.category,
          quantity: item.defaultQuantity,
        };
      });
    });
    setSelectedAssetsMap(map);
  }

  // Bỏ chọn tất cả
  function handleClearAllAssets() {
    setSelectedAssetsMap({});
  }

  // Đồng bộ selectedAssetsMap vào form values
  useEffect(() => {
    const assetsList = Object.entries(selectedAssetsMap).map(([name, val]) => ({
      name,
      category: val.category,
      quantity: val.quantity,
    }));
    form.setValue("selectedAssets", assetsList);
  }, [selectedAssetsMap, form]);

  const { submit, pending } = useSubmit(
    async (v: RoomInput) => {
      if (isDuplicateName) {
        return {
          ok: false as const,
          error: `Tên phòng "${v.name}" đã tồn tại trong nhà trọ này!`,
        };
      }
      return createRoom(propertyId, v);
    },
    {
      successKey: "rooms.created",
      onSuccess: (d) => router.push(`/contracts/new?roomId=${d.id}`),
    },
  );

  const { errors } = form.formState;
  const totalSelectedAssetsCount = Object.keys(selectedAssetsMap).length;

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex max-w-2xl flex-col gap-6 rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm"
    >
      {/* 1. CHỌN LOẠI PHÒNG (Room Type Cards) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">1. Loại phòng / Kiểu phòng</h3>
        <p className="text-xs text-muted-foreground">
          Chọn phong cách thiết kế và đặc tính của phòng để khách dễ nhận diện.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {ROOM_TYPES.map((rt) => {
            const isSelected = currentRoomType === rt.id;
            return (
              <button
                key={rt.id}
                type="button"
                onClick={() => form.setValue("roomType", rt.id)}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs ring-1 ring-primary"
                    : "border-border/60 bg-card hover:bg-muted/50 text-foreground",
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {rt.id === "standard" && <DoorClosed size={16} />}
                    {rt.id === "balcony" && <SunMedium size={16} />}
                    {rt.id === "mezzanine" && <Layers size={16} />}
                    {rt.id === "studio" && <Sparkles size={16} />}
                    {rt.id === "window" && <AppWindow size={16} />}
                    {rt.id === "duplex" && <Building size={16} />}
                  </div>
                  {isSelected && <Check size={16} className="text-primary font-bold" />}
                </div>
                <span className="text-sm font-bold">{rt.name}</span>
                <span className="text-[11px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                  {rt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. VỊ TRÍ, TÊN PHÒNG & KIỂM TRA TRÙNG PHÒNG */}
      <div className="space-y-3 pt-3 border-t border-border/40">
        <h3 className="text-sm font-bold text-foreground">2. Vị trí & Tên số hiệu phòng</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tầng */}
          <div className="space-y-1">
            <label htmlFor="floorSelect" className="text-xs font-medium text-foreground">
              Tầng
            </label>
            <select
              id="floorSelect"
              value={selectedFloor}
              onChange={(e) => {
                const fl = Number(e.target.value);
                setSelectedFloor(fl);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={0}>Tầng Trệt (Tầng 0)</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((fl) => (
                <option key={fl} value={fl}>
                  Tầng {fl}
                </option>
              ))}
            </select>
          </div>

          {/* Số thứ tự phòng trong tầng */}
          <div className="space-y-1">
            <label htmlFor="roomOrderInput" className="text-xs font-medium text-foreground">
              Số phòng trong tầng
            </label>
            <Input
              id="roomOrderInput"
              value={roomOrder}
              onChange={(e) => {
                setRoomOrder(e.target.value);
              }}
              placeholder="01, 02, 03..."
              className="font-mono text-sm"
            />
          </div>

          {/* Tên phòng hoàn chỉnh */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="name" className="text-xs font-medium text-foreground">
                Tên hiển thị
              </label>
              {isCustomName && (
                <button
                  type="button"
                  onClick={() => setIsCustomName(false)}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  <RotateCcw size={10} />
                  <span>Tự động</span>
                </button>
              )}
            </div>
            <Input
              id="name"
              {...form.register("name", {
                onChange: () => setIsCustomName(true),
              })}
              placeholder="VD: 101, P.202..."
              className={cn(
                "font-bold text-sm",
                isDuplicateName && "border-destructive focus-visible:ring-destructive",
              )}
            />
          </div>
        </div>

        {/* Cảnh báo trùng lặp phòng */}
        {isDuplicateName ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              Phòng <strong>"{currentRoomName}"</strong> đã tồn tại trong nhà trọ này. Vui lòng chọn
              số phòng khác!
            </span>
          </div>
        ) : null}

        {/* Gợi ý các phòng đã có ở tầng này */}
        {roomsOnCurrentFloor.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Các phòng hiện có ở Tầng {selectedFloor}:{" "}
            {roomsOnCurrentFloor.map((r) => r.name).join(", ")}
          </p>
        )}
      </div>

      {/* 3. THÔNG SỐ GIÁ THUÊ VÀ DIỆN TÍCH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/40">
        <Field
          id="rentPrice"
          label="Giá thuê phòng / tháng"
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
                  suffix="₫/tháng"
                  invalid={p.invalid}
                />
              )}
            />
          )}
        </Field>

        <Field id="area" label="Diện tích phòng (m²)">
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

      {/* 4. TRANG THIẾT BỊ & NỘI THẤT BÀN GIAO (Catalog tích chọn) */}
      <div className="space-y-3 pt-3 border-t border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                3. Trang thiết bị & Nội thất bàn giao
              </h3>
              {totalSelectedAssetsCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Đã chọn {totalSelectedAssetsCount} món
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tích chọn các đồ đạc có sẵn trong phòng để tự động tạo biên bản bàn giao và hợp đồng.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectBasicAssets}
              className="text-xs h-7 px-2"
            >
              <Zap size={12} className="mr-1 text-amber-500" />
              <span>Nội thất cơ bản</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectFullAssets}
              className="text-xs h-7 px-2"
            >
              <Sparkles size={12} className="mr-1 text-primary" />
              <span>Full nội thất</span>
            </Button>
            {totalSelectedAssetsCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAllAssets}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                Bỏ chọn
              </Button>
            )}
          </div>
        </div>

        {/* Groups of assets */}
        <div className="space-y-4 pt-1">
          {PREDEFINED_ROOM_ASSETS.map((group) => (
            <div
              key={group.category}
              className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3.5"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                {group.title}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const isChecked = !!selectedAssetsMap[item.name];
                  const currentQty = selectedAssetsMap[item.name]?.quantity || 1;

                  return (
                    <div
                      key={item.name}
                      className={cn(
                        "flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-all",
                        isChecked
                          ? "border-primary/50 bg-primary/5 text-foreground font-medium"
                          : "border-border/40 bg-card text-muted-foreground hover:border-border",
                      )}
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            toggleAsset(item.name, item.category, item.defaultQuantity)
                          }
                          className="size-4 accent-primary rounded cursor-pointer"
                        />
                        <span className="truncate">{item.name}</span>
                      </label>

                      {/* Nút tăng giảm số lượng khi đã tick */}
                      {isChecked && (
                        <div className="flex items-center gap-1 shrink-0 bg-background border border-border/60 rounded px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateAssetQty(item.name, -1)}
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                            title="Giảm số lượng"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-bold font-mono text-[11px] min-w-3 text-center">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateAssetQty(item.name, 1)}
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                            title="Tăng số lượng"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="min-h-11 text-base mt-2"
        disabled={pending || isDuplicateName}
      >
        {pending ? "Đang tạo phòng..." : t("rooms.create")}
      </Button>
    </form>
  );
}
