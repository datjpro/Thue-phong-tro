"use client";

import { Check, ChevronDown, Loader2, Sparkles, Wrench } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateRoomStatus } from "../actions";

interface Props {
  propertyId: string;
  roomId: string;
  currentStatus: "vacant" | "occupied" | "maintenance";
  hasActiveContract?: boolean;
}

export function RoomStatusDropdown({
  propertyId,
  roomId,
  currentStatus,
  hasActiveContract = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Nếu phòng đang có hợp đồng active thì trạng thái tự nhiên là "Đang thuê"
  const effectiveStatus = hasActiveContract ? "occupied" : currentStatus;

  function handleSelect(nextStatus: "vacant" | "maintenance") {
    setOpen(false);
    if (nextStatus === currentStatus) return;

    startTransition(async () => {
      const res = await updateRoomStatus(propertyId, roomId, nextStatus);
      if (res.ok) {
        toast.success(
          nextStatus === "maintenance"
            ? "Đã chuyển phòng sang trạng thái Đang sửa chữa / Bảo trì"
            : "Đã chuyển phòng sang trạng thái Sẵn sàng / Còn trống",
        );
      } else {
        toast.error("Không thể cập nhật trạng thái phòng");
      }
    });
  }

  if (hasActiveContract) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <span className="size-2 rounded-full bg-emerald-500" />
        Đang cho thuê
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{
          borderColor:
            effectiveStatus === "maintenance" ? "rgba(217, 119, 6, 0.4)" : "rgba(34, 197, 94, 0.4)",
          backgroundColor:
            effectiveStatus === "maintenance"
              ? "rgba(217, 119, 6, 0.12)"
              : "rgba(34, 197, 94, 0.12)",
          color:
            effectiveStatus === "maintenance"
              ? "var(--color-warning, #d97706)"
              : "var(--color-success, #16a34a)",
        }}
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : effectiveStatus === "maintenance" ? (
          <Wrench size={12} />
        ) : (
          <Sparkles size={12} />
        )}
        <span>
          {effectiveStatus === "maintenance" ? "Đang sửa chữa" : "Phòng trống / Sẵn sàng"}
        </span>
        <ChevronDown size={12} className="opacity-70" />
      </button>

      {open ? (
        <>
          {/* Backdrop button to close */}
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default bg-transparent border-none p-0"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu chọn trạng thái"
          />

          {/* Menu options */}
          <div className="absolute right-0 z-30 mt-1.5 w-56 origin-top-right rounded-xl border border-border/80 bg-card p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Đổi trạng thái phòng
            </div>

            <button
              type="button"
              onClick={() => handleSelect("vacant")}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Phòng trống / Sẵn sàng</span>
              </span>
              {currentStatus === "vacant" ? <Check size={14} className="text-primary" /> : null}
            </button>

            <button
              type="button"
              onClick={() => handleSelect("maintenance")}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>Đang sửa chữa / Bảo trì</span>
              </span>
              {currentStatus === "maintenance" ? (
                <Check size={14} className="text-primary" />
              ) : null}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
