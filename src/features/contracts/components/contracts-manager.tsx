"use client";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Phone,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { ContractRow } from "../queries";
import { EndContractButton } from "./end-contract-button";

interface Props {
  propertyId: string;
  contracts: ContractRow[];
  today: string;
}

export function ContractsManager({ propertyId, contracts, today }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expiring" | "ended">("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [groupByFloor, setGroupByFloor] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Danh sách các tầng có trong danh sách
  const availableFloors = useMemo(() => {
    const floors = new Set<number>();
    contracts.forEach((c) => {
      if (c.floor !== null && c.floor !== undefined) {
        floors.add(c.floor);
      }
    });
    return Array.from(floors).sort((a, b) => a - b);
  }, [contracts]);

  // Thống kê tóm tắt
  const stats = useMemo(() => {
    const total = contracts.length;
    const activeContracts = contracts.filter((c) => c.status === "active");
    const activeCount = activeContracts.length;
    const totalActiveRent = activeContracts.reduce((sum, c) => sum + (c.rentPrice || 0), 0);
    const expiringCount = contracts.filter((c) => c.isExpiringSoon).length;
    const endedCount = contracts.filter((c) => c.status === "ended").length;

    return {
      total,
      activeCount,
      totalActiveRent,
      expiringCount,
      endedCount,
    };
  }, [contracts]);

  // Danh sách hợp đồng sắp hết hạn để hiện cảnh báo nổi bật
  const expiringContracts = useMemo(() => {
    return contracts.filter((c) => c.isExpiringSoon);
  }, [contracts]);

  // Lọc dữ liệu
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Lọc trạng thái
      if (statusFilter === "active" && c.status !== "active") return false;
      if (statusFilter === "expiring" && !c.isExpiringSoon) return false;
      if (statusFilter === "ended" && c.status !== "ended") return false;

      // Lọc tầng
      if (floorFilter !== "all") {
        if (c.floor === null || c.floor === undefined || String(c.floor) !== floorFilter) {
          return false;
        }
      }

      // Tìm kiếm (Mã phòng, Tên khách, SĐT, Mã HĐ)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchRoom = c.roomName.toLowerCase().includes(query);
        const matchTenant = (c.tenantName || "").toLowerCase().includes(query);
        const matchPhone = (c.tenantPhone || "").toLowerCase().includes(query);
        const matchNumber = (c.contractNumber || "").toLowerCase().includes(query);

        if (!matchRoom && !matchTenant && !matchPhone && !matchNumber) {
          return false;
        }
      }

      return true;
    });
  }, [contracts, statusFilter, floorFilter, searchQuery]);

  // Phân trang
  const totalPages = Math.ceil(filteredContracts.length / pageSize) || 1;
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, currentPage, pageSize]);

  // Gom nhóm theo tầng nếu bật groupByFloor
  const floorGroups = useMemo(() => {
    if (!groupByFloor) return null;
    const groups: Record<string, ContractRow[]> = {};

    paginatedContracts.forEach((item) => {
      const key =
        item.floor !== null && item.floor !== undefined
          ? `Tầng ${item.floor}`
          : item.roomName
            ? `Phòng ${item.roomName}`
            : "Chưa gắn tầng";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [paginatedContracts, groupByFloor]);

  // Xuất danh sách hợp đồng ra CSV
  function handleExportCsv() {
    if (filteredContracts.length === 0) {
      toast.error("Không có hợp đồng nào để xuất");
      return;
    }

    const headers = [
      "Mã HĐ",
      "Phòng",
      "Tầng",
      "Người đại diện",
      "Số điện thoại",
      "CCCD",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Giá thuê/tháng",
      "Tiền cọc",
      "Chu kỳ đóng",
      "Trạng thái",
    ];

    const rows = filteredContracts.map((c) => [
      `"${c.contractNumber || ""}"`,
      `"${c.roomName}"`,
      `"${c.floor ?? ""}"`,
      `"${(c.tenantName || "").replace(/"/g, '""')}"`,
      c.tenantPhone ? `="${c.tenantPhone.replace(/"/g, '""')}"` : `""`,
      c.tenantIdNumber ? `="${c.tenantIdNumber.replace(/"/g, '""')}"` : `""`,
      `"${formatDate(c.startDate)}"`,
      `"${c.endDate ? formatDate(c.endDate) : "Không thời hạn"}"`,
      c.rentPrice,
      c.deposit,
      `"${c.billingCycle} tháng/lần"`,
      `"${c.status === "active" ? "Đang hiệu lực" : c.status === "ended" ? "Đã kết thúc" : c.status}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      `DANH SÁCH HỢP ĐỒNG THUÊ PHÒNG\n` +
      `Ngày xuất: ${formatDate(today)}\n\n` +
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Danh_sach_hop_dong_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filteredContracts.length} hợp đồng ra file CSV`);
  }

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ TỔNG QUAN (Summary Cards) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Tổng số HĐ */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Tổng hợp đồng</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
              <FileText size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">hồ sơ</span>
          </div>
        </div>

        {/* Đang hiệu lực */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-medium">Đang hiệu lực</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
              {stats.activeCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80">
              ({formatMoney(stats.totalActiveRent)}/th)
            </span>
          </div>
        </div>

        {/* Sắp hết hạn (30 ngày) */}
        <div
          className={`rounded-xl border p-4 shadow-2xs transition-colors ${
            stats.expiringCount > 0
              ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              : "border-border/60 bg-card text-muted-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Sắp hết hạn</span>
            <div
              className={`flex size-7 items-center justify-center rounded-lg ${
                stats.expiringCount > 0
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                stats.expiringCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-foreground"
              }`}
            >
              {stats.expiringCount}
            </span>
            <span className="text-xs text-muted-foreground">cần gia hạn</span>
          </div>
        </div>

        {/* Đã kết thúc / Lưu trữ */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Đã kết thúc</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
              <FileCheck size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {stats.endedCount}
            </span>
            <span className="text-xs text-muted-foreground">lịch sử</span>
          </div>
        </div>
      </div>

      {/* BANNER CẢNH BÁO SẮP HẾT HẠN */}
      {expiringContracts.length > 0 && statusFilter !== "ended" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/80 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 shadow-2xs">
          <AlertTriangle size={20} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold">
              Có {expiringContracts.length} hợp đồng sắp hết hạn trong 30 ngày tới:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {expiringContracts.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100 border border-amber-500/20"
                >
                  <Building2 size={12} className="text-amber-700 dark:text-amber-300" />
                  {c.roomName} ({c.tenantName ?? "Khách"}) · còn {c.daysRemaining} ngày
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. BỘ LỌC & THANH TÌM KIẾM */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
        {/* Hàng 1: Tabs Trạng thái & Nút chức năng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              Đang hiệu lực ({stats.activeCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("expiring");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === "expiring"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              Sắp hết hạn ({stats.expiringCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ended");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === "ended"
                  ? "bg-slate-700 text-white shadow-2xs dark:bg-slate-300 dark:text-slate-900"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Đã kết thúc ({stats.endedCount})
            </button>
          </div>

          {/* Action buttons (Xuất CSV & Gom nhóm tầng) */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGroupByFloor(!groupByFloor)}
              className="text-xs"
              title="Gom nhóm danh sách theo tầng hoặc trải phẳng"
            >
              <Layers size={14} className="mr-1 text-primary" />
              <span>{groupByFloor ? "Nhóm tầng: Bật" : "Nhóm tầng: Tắt"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={contracts.length === 0}
              className="text-xs"
            >
              <FileSpreadsheet size={14} className="mr-1 text-emerald-600" />
              <span>Xuất Excel</span>
            </Button>
          </div>
        </div>

        {/* Hàng 2: Ô tìm kiếm & Dropdown lọc tầng */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
          {/* Search box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />
            <input
              type="text"
              placeholder="Tìm theo số phòng, tên khách thuê, SĐT, mã hợp đồng..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-8 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Floor filter dropdown */}
          <div className="relative">
            <Filter
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <select
              value={floorFilter}
              onChange={(e) => {
                setFloorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tất cả tầng</option>
              {availableFloors.map((fl) => (
                <option key={fl} value={String(fl)}>
                  Tầng {fl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH HỢP ĐỒNG (Contract List) */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy hợp đồng phù hợp"
          description={
            contracts.length === 0
              ? "Chưa có hợp đồng thuê nào trong hệ thống. Hãy bấm nút 'Lập hợp đồng mới' ở góc trên."
              : "Không có hợp đồng nào khớp với điều kiện lọc hoặc từ khóa tìm kiếm."
          }
          icon={FileText}
          action={
            searchQuery || statusFilter !== "all" || floorFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setFloorFilter("all");
                }}
              >
                Đặt lại bộ lọc
              </Button>
            ) : (
              <Link href="/contracts/new" className={buttonVariants({ variant: "primary" })}>
                <Plus size={18} aria-hidden="true" />
                <span>Lập hợp đồng mới</span>
              </Link>
            )
          }
        />
      ) : groupByFloor && floorGroups ? (
        /* Hiển thị gom nhóm theo tầng */
        <div className="space-y-6">
          {Object.entries(floorGroups).map(([groupTitle, groupContracts]) => (
            <div key={groupTitle} className="space-y-3">
              {/* Floor Header */}
              <div className="flex items-center gap-2 border-b border-border/50 pb-1.5">
                <Layers size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground tracking-tight">{groupTitle}</h3>
                <span className="text-xs text-muted-foreground">
                  ({groupContracts.length} hợp đồng)
                </span>
              </div>

              {/* Cards for this floor */}
              <div className="flex flex-col gap-3">
                {groupContracts.map((c) => (
                  <ContractCard key={c.id} contract={c} propertyId={propertyId} today={today} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Hiển thị trải phẳng */
        <div className="flex flex-col gap-3">
          {paginatedContracts.map((c) => (
            <ContractCard key={c.id} contract={c} propertyId={propertyId} today={today} />
          ))}
        </div>
      )}

      {/* 4. PHÂN TRANG (Pagination) */}
      {filteredContracts.length > pageSize ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <div>
            Hiển thị{" "}
            <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span>{" "}
            -{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * pageSize, filteredContracts.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium text-foreground">{filteredContracts.length}</span> hợp đồng
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              <option value={10}>10 dòng/trang</option>
              <option value={15}>15 dòng/trang</option>
              <option value={25}>25 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
            </select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="px-2 font-medium text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Component Thẻ Hợp Đồng Chi Tiết */
function ContractCard({
  contract: c,
  propertyId,
  today,
}: {
  contract: ContractRow;
  propertyId: string;
  today: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs ${
        c.isExpiringSoon
          ? "border-amber-400/80 bg-amber-500/5 dark:border-amber-700/60"
          : "border-border/60"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Khối Thông tin Phòng & Người đại diện */}
        <div className="space-y-2 min-w-0">
          {/* Header thẻ: Tên phòng, Mã HĐ, Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-sm sm:text-base text-primary">
              <Building2 size={15} />
              {c.roomName}
            </span>

            {c.floor !== null && c.floor !== undefined ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground border border-border/60">
                Tầng {c.floor}
              </span>
            ) : null}

            {c.contractNumber ? (
              <span className="font-mono text-xs text-muted-foreground bg-muted/80 px-2 py-0.5 rounded border border-border/40">
                #{c.contractNumber}
              </span>
            ) : null}

            <StatusBadge kind={c.status} />

            {c.isExpiringSoon ? (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Clock size={12} />
                Sắp hết hạn ({c.daysRemaining} ngày)
              </span>
            ) : null}
          </div>

          {/* Thông tin khách thuê đại diện */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <User size={13} className="text-primary/70" />
              {c.tenantName ?? "Chưa có người đại diện"}
            </span>

            {c.tenantPhone ? (
              <span className="flex items-center gap-1 font-mono">
                <Phone size={12} className="text-muted-foreground/70" />
                <a href={`tel:${c.tenantPhone}`} className="hover:underline text-foreground">
                  {c.tenantPhone}
                </a>
              </span>
            ) : null}

            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-muted-foreground/70" />
              Thời hạn: {formatDate(c.startDate)} →{" "}
              {c.endDate ? formatDate(c.endDate) : "Không thời hạn"}
              {c.billingCycle > 1 ? ` (Đóng ${c.billingCycle} tháng/lần)` : ""}
            </span>
          </div>
        </div>

        {/* Khối Tài chính & Nút Thao Tác */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 border-t border-border/40 pt-3 lg:border-0 lg:pt-0">
          {/* Thông tin Giá thuê & Tiền cọc */}
          <div className="flex items-center gap-4 text-right">
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground">Giá thuê</span>
              <span className="font-mono text-base font-bold tabular-nums text-foreground">
                {formatMoney(c.rentPrice)}
                <span className="text-xs font-normal text-muted-foreground">/th</span>
              </span>
            </div>

            {c.deposit > 0 ? (
              <div className="flex flex-col border-l border-border/50 pl-3">
                <span className="text-[11px] text-muted-foreground">Tiền cọc</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {formatMoney(c.deposit)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Nút Hành động */}
          <div className="flex items-center gap-2">
            <Link
              href={`/contracts/${c.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
              title="Xem văn bản hợp đồng pháp lý"
            >
              <Eye size={14} className="mr-1 text-primary" />
              <span>Hợp đồng</span>
            </Link>

            {c.status === "active" ? (
              <EndContractButton propertyId={propertyId} contractId={c.id} today={today} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
