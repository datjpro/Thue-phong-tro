"use client";

import {
  Bed,
  CheckCircle2,
  ChevronRight,
  Clock,
  DoorClosed,
  Grid,
  Layers,
  List,
  User,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getRoomTypeLabel } from "../constants";

export type RoomRow = {
  id: string;
  name: string;
  floor: number | null;
  area: number | null;
  rentPrice: number;
  roomType: string;
  status: "vacant" | "occupied" | "maintenance";
  tenantName: string | null;
  hasActiveContract: boolean;
  activeContractsCount?: number;
  contractEndDate?: string | null;
  isExpiringSoon?: boolean;
  daysUntilExpire?: number | null;
  beds?: Array<{ id: string; name: string; rentPrice: number; status: string }>;
  occupiedBedsCount?: number;
  hasReading?: boolean;
  invoice: { total: number; status: "unpaid" | "partial" | "paid"; dueDate: string } | null;
};

interface Props {
  rows: RoomRow[];
  today: string;
  defaultView?: "grid" | "row";
}

export function RoomViewSwitcher({ rows, today, defaultView = "grid" }: Props) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<"grid" | "row">(defaultView);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("room_view_mode") as "grid" | "row" | null;
      if (saved === "grid" || saved === "row") {
        setViewMode(saved);
      }
    } catch (_) {}
  }, []);

  function handleSwitch(mode: "grid" | "row") {
    setViewMode(mode);
    try {
      localStorage.setItem("room_view_mode", mode);
    } catch (_) {}
  }

  // Nhóm phòng theo tầng
  const floorGroups = rows.reduce<Record<string, RoomRow[]>>((acc, room) => {
    const floorKey = room.floor !== null ? `Tầng ${room.floor}` : "Chưa phân tầng";
    if (!acc[floorKey]) acc[floorKey] = [];
    acc[floorKey].push(room);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Control bar: Switch Grid / Row and Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-2xs">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-muted-foreground mr-1">Trạng thái:</span>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="text-foreground">Đang thuê</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500 shadow-2xs" />
            <span className="text-foreground">Sắp hết hạn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shadow-2xs" />
            <span className="text-foreground">Còn trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500 shadow-2xs" />
            <span className="text-foreground">Đang sửa</span>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleSwitch("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all select-none",
              viewMode === "grid"
                ? "bg-card text-foreground shadow-2xs ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Sơ đồ phòng trực quan"
          >
            <Grid size={14} />
            <span>Sơ đồ</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitch("row")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all select-none",
              viewMode === "row"
                ? "bg-card text-foreground shadow-2xs ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Danh sách phòng"
          >
            <List size={14} />
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* Grid View (Floor Plan Layout) */}
      {viewMode === "grid" ? (
        <div className="space-y-6">
          {Object.entries(floorGroups).map(([floorName, floorRooms]) => (
            <div key={floorName} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                <Layers size={16} className="text-primary" />
                <h3 className="text-sm font-bold tracking-tight text-foreground">{floorName}</h3>
                <span className="text-xs text-muted-foreground">({floorRooms.length} phòng)</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floorRooms.map((r) => {
                  const isDorm = r.roomType === "dormitory" || r.roomType === "sleepbox";
                  const totalBeds = r.beds?.length || 0;
                  const occupiedBeds = r.occupiedBedsCount ?? (r.hasActiveContract ? 1 : 0);

                  let cardToneBorder = "border-slate-200 dark:border-slate-800";
                  let headerToneBg = "bg-slate-50 dark:bg-slate-900/50";
                  let statusBadgeColor =
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                  let statusLabel = "Còn trống";

                  if (r.status === "maintenance") {
                    cardToneBorder = "border-rose-300 dark:border-rose-900/70";
                    headerToneBg = "bg-rose-50/70 dark:bg-rose-950/30";
                    statusBadgeColor =
                      "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200";
                    statusLabel = "Đang sửa";
                  } else if (r.isExpiringSoon) {
                    cardToneBorder = "border-amber-400 dark:border-amber-800";
                    headerToneBg = "bg-amber-50/80 dark:bg-amber-950/30";
                    statusBadgeColor =
                      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
                    statusLabel = `Hết hạn sau ${r.daysUntilExpire} ngày`;
                  } else if (r.hasActiveContract) {
                    cardToneBorder = "border-emerald-300 dark:border-emerald-900/70";
                    headerToneBg = "bg-emerald-50/60 dark:bg-emerald-950/30";
                    statusBadgeColor =
                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
                    statusLabel = "Đang thuê";
                  }

                  return (
                    <Link
                      key={r.id}
                      href={`/rooms/${r.id}`}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                        cardToneBorder,
                      )}
                    >
                      {/* Top Header */}
                      <div
                        className={cn(
                          "flex items-start justify-between p-3.5 border-b border-border/40",
                          headerToneBg,
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-card shadow-2xs ring-1 ring-border/60 text-primary">
                            {isDorm ? <Bed size={17} /> : <DoorClosed size={17} />}
                          </div>
                          <div>
                            <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                              {r.name}
                            </span>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <span>{getRoomTypeLabel(r.roomType)}</span>
                              {r.area ? ` · ${r.area}m²` : ""}
                            </div>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight",
                            statusBadgeColor,
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Body Content */}
                      <div className="p-3.5 space-y-2.5 text-xs">
                        {/* Dormitory / Sleepbox Bed Progress */}
                        {isDorm && totalBeds > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-muted-foreground font-medium">
                              <span>Số giường:</span>
                              <span className="font-mono text-foreground font-bold">
                                {occupiedBeds}/{totalBeds} giường
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {r.beds?.map((b) => (
                                <span
                                  key={b.id}
                                  title={`${b.name}: ${b.status === "occupied" ? "Đã thuê" : "Trống"}`}
                                  className={cn(
                                    "h-2 flex-1 rounded-full",
                                    b.status === "occupied"
                                      ? "bg-emerald-500"
                                      : b.status === "maintenance"
                                        ? "bg-rose-500"
                                        : "bg-muted",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                            <User size={13} className="shrink-0 text-muted-foreground/70" />
                            <span className="truncate text-foreground font-medium">
                              {r.tenantName ?? "Chưa có khách thuê"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-border/30">
                          <span className="text-muted-foreground">Giá thuê:</span>
                          <span className="font-bold text-foreground tabular-nums">
                            {formatMoney(r.rentPrice)}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              /th
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Footer: Month Invoice status */}
                      <div className="flex items-center justify-between bg-muted/20 px-3.5 py-2.5 border-t border-border/40 text-xs">
                        {r.invoice ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-muted-foreground font-medium">Hóa đơn:</span>
                            <span className="font-mono font-bold tabular-nums text-foreground">
                              {formatMoney(r.invoice.total)}
                            </span>
                          </div>
                        ) : r.hasActiveContract ? (
                          r.hasReading ? (
                            <span className="inline-flex items-center gap-1 text-primary font-medium text-[11px]">
                              <CheckCircle2 size={12} />
                              Đã chốt số · Chờ lập HĐ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-[11px]">
                              <Clock size={12} />
                              Chưa lập HĐ kỳ này
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Trống kỳ này</span>
                        )}
                        <ChevronRight
                          size={14}
                          className="text-muted-foreground group-hover:text-primary transition-colors ml-1"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Row / Table View */
        <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
          {rows.map((r) => {
            const invStatus = r.invoice
              ? invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today)
              : null;

            return (
              <div
                key={r.id}
                className="group flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {r.roomType !== "standard" ? <Bed size={18} /> : <DoorClosed size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/rooms/${r.id}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {r.name}
                      </Link>
                      {r.floor !== null ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Tầng {r.floor}
                        </span>
                      ) : null}
                      <StatusBadge kind={r.status} />
                      {r.isExpiringSoon ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Sắp hết hạn ({r.daysUntilExpire}d)
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{r.tenantName ?? t("rooms.noTenant")}</span>
                      <span>·</span>
                      <span className="font-semibold text-foreground">
                        {formatMoney(r.rentPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-border/30 pt-2 sm:border-0 sm:pt-0">
                  {r.invoice && invStatus ? (
                    <div className="flex flex-col sm:items-end">
                      <StatusBadge kind={invStatus} />
                      <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                        {formatMoney(r.invoice.total)}
                      </span>
                    </div>
                  ) : r.hasActiveContract ? (
                    r.hasReading ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <CheckCircle2 size={12} />
                        Đã chốt số
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        <Clock size={12} />
                        Chưa lập HĐ
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("status.vacant")}</span>
                  )}

                  <Link
                    href={`/rooms/${r.id}`}
                    aria-label={`Xem chi tiết ${r.name}`}
                    className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
