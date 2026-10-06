"use client";

import {
  AlertTriangle,
  Lock,
  type LucideIcon,
  MessageCircle,
  MessageSquare,
  Search,
  ShieldAlert,
  Trash2,
  Volume2,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { MaintenanceItem } from "../queries";
import type { FeedbackCategory } from "../schemas";
import { MaintenanceActionModal } from "./maintenance-action-modal";

const CATEGORY_META: Record<
  FeedbackCategory,
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  noise: {
    label: "Tiếng ồn / Giờ giấc",
    icon: Volume2,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  cleanliness: {
    label: "Vệ sinh / Môi trường",
    icon: Trash2,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  security: {
    label: "An ninh & Nội quy",
    icon: ShieldAlert,
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  facility: {
    label: "Sửa chữa thiết bị",
    icon: Wrench,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  other: {
    label: "Góp ý & Khác",
    icon: MessageSquare,
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

interface Props {
  propertyId: string;
  items: MaintenanceItem[];
  isTenant: boolean;
}

export function MaintenanceListView({ propertyId, items, isTenant }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedStatus === "pending" && (item.status === "done" || item.status === "rejected"))
      return false;
    if (selectedStatus === "done" && item.status !== "done") return false;
    if (selectedStatus === "rejected" && item.status !== "rejected") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) ?? false;
      const matchRoom = item.roomName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRoom) return false;
    }
    return true;
  });

  const countPending = items.filter(
    (i) => i.status === "open" || i.status === "in_progress",
  ).length;

  return (
    <div className="space-y-4">
      {/* Category Tabs & Quick Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("noise")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
              selectedCategory === "noise"
                ? "bg-amber-600 text-white font-semibold shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Volume2 size={13} />
            <span>Tiếng ồn ({items.filter((i) => i.category === "noise").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("cleanliness")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
              selectedCategory === "cleanliness"
                ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Trash2 size={13} />
            <span>Vệ sinh ({items.filter((i) => i.category === "cleanliness").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("security")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
              selectedCategory === "security"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ShieldAlert size={13} />
            <span>An ninh ({items.filter((i) => i.category === "security").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("facility")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
              selectedCategory === "facility"
                ? "bg-blue-600 text-white font-semibold shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Wrench size={13} />
            <span>Sửa chữa ({items.filter((i) => i.category === "facility").length})</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-32 sm:w-44 rounded-lg border border-input bg-background pl-7 pr-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <select
            aria-label="Lọc theo trạng thái xử lý"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ & Đang xử lý ({countPending})</option>
            <option value="done">Đã hoàn thành</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* List Feedbacks */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
          <p className="text-sm font-medium text-foreground">Không có phản ánh nào phù hợp</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedCategory !== "all" || selectedStatus !== "all"
              ? "Hãy thử đổi bộ lọc hoặc xem tất cả danh mục."
              : "Hiện tại chưa có phản ánh hay báo sửa chữa nào."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((r) => {
            const meta = CATEGORY_META[r.category as FeedbackCategory] || CATEGORY_META.facility;
            const CategoryIcon = meta.icon;

            return (
              <div
                key={r.id}
                className={cn(
                  "flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-primary/40",
                  r.priority === "urgent" && r.status !== "done"
                    ? "border-rose-500/40 bg-rose-500/5"
                    : "border-border/60",
                )}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Category, Status & Priority Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          meta.badgeClass,
                        )}
                      >
                        <CategoryIcon size={12} />
                        <span>{meta.label}</span>
                      </span>

                      {r.priority === "urgent" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                          <AlertTriangle size={11} />
                          <span>Khẩn cấp</span>
                        </span>
                      ) : null}

                      {r.isAnonymous === "yes" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Lock size={10} />
                          <span>Ẩn danh</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge kind={r.status} />
                    </div>
                  </div>

                  {/* Title & Room metadata */}
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{r.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">{r.roomName}</span>
                      {" · "}
                      <span>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Description Box */}
                  {r.description ? (
                    <p className="text-xs sm:text-sm text-foreground/90 bg-muted/40 p-3 rounded-lg border border-border/40 whitespace-pre-wrap">
                      {r.description}
                    </p>
                  ) : null}

                  {/* Landlord Resolution / Response Callout */}
                  {r.response ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                        <MessageCircle size={14} />
                        <span>Phản hồi từ Chủ trọ / Ban quản lý:</span>
                      </div>
                      <p className="text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap">
                        {r.response}
                      </p>
                      {r.cost > 0 ? (
                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">
                          Chi phí sửa chữa: {formatMoney(r.cost)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Landlord Action Bar */}
                {!isTenant ? (
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-3 shrink-0">
                    <MaintenanceActionModal propertyId={propertyId} item={r} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
