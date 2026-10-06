"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  Gauge,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDate, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { deleteInvoice, recordBulkPayments, recordQuickPayment } from "../actions";
import type { BatchRoomCandidate, InvoiceListItem } from "../queries";
import { BatchInvoiceModal } from "./batch-invoice-modal";

interface Props {
  propertyId: string;
  propertyName: string;
  invoices: InvoiceListItem[];
  periods: string[];
  isTenant: boolean;
  batchContext?: {
    candidates: BatchRoomCandidate[];
    electricPrice: number;
    waterPrice: number;
  } | null;
}

export function InvoicesManager({
  propertyId,
  propertyName,
  invoices,
  periods,
  isTenant,
  batchContext,
}: Props) {
  const router = useRouter();
  const today = todayVn();
  const [pending, startTransition] = useTransition();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[0] || "all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection & Bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [quickPayInvoice, setQuickPayInvoice] = useState<InvoiceListItem | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<InvoiceListItem | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Available floors
  const floors = useMemo(() => {
    const list = invoices
      .map((i) => i.floor)
      .filter((f): f is number => f !== null && f !== undefined);
    return [...new Set(list)].sort((a, b) => a - b);
  }, [invoices]);

  // Filtered rows
  const filteredInvoices = useMemo(() => {
    return invoices.filter((r) => {
      // Filter by period
      if (selectedPeriod !== "all" && r.period !== selectedPeriod) return false;

      // Filter by floor
      if (selectedFloor !== "all") {
        const targetFloor = Number(selectedFloor);
        if (r.floor !== targetFloor) return false;
      }

      // Filter by status
      const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
      if (statusFilter === "unpaid" && r.status === "paid") return false;
      if (statusFilter === "paid" && r.status !== "paid") return false;
      if (statusFilter === "overdue" && dispStatus !== "overdue") return false;
      if (statusFilter === "partial" && r.status !== "partial") return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchRoom = r.roomName.toLowerCase().includes(q);
        const matchTenant = r.tenantName?.toLowerCase().includes(q) ?? false;
        const matchPhone = r.tenantPhone?.includes(q) ?? false;
        if (!matchRoom && !matchTenant && !matchPhone) return false;
      }

      return true;
    });
  }, [invoices, selectedPeriod, selectedFloor, statusFilter, searchTerm, today]);

  // Summary Metrics calculation (based on current period filter or all)
  const summary = useMemo(() => {
    const base =
      selectedPeriod !== "all"
        ? invoices.filter((i) => i.period === selectedPeriod)
        : filteredInvoices;

    const totalInvoices = base.length;
    let totalMustPay = 0;
    let totalPaid = 0;
    let unpaidCount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    for (const inv of base) {
      totalMustPay += inv.total;
      totalPaid += inv.paidAmount;
      const remaining = inv.total - inv.paidAmount;
      const disp = invoiceDisplayStatus(inv.status, inv.dueDate, today);

      if (remaining > 0) {
        unpaidCount++;
        if (disp === "overdue") {
          overdueCount++;
          overdueAmount += remaining;
        }
      }
    }

    const totalRemaining = Math.max(0, totalMustPay - totalPaid);
    const paidPercent = totalMustPay > 0 ? Math.round((totalPaid / totalMustPay) * 100) : 100;

    return {
      totalInvoices,
      totalMustPay,
      totalPaid,
      paidPercent,
      totalRemaining,
      unpaidCount,
      overdueCount,
      overdueAmount,
    };
  }, [invoices, filteredInvoices, selectedPeriod, today]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page, pageSize]);

  // Handle select all
  const allCurrentSelected =
    paginatedInvoices.length > 0 && paginatedInvoices.every((i) => selectedIds.includes(i.id));

  function toggleSelectAll() {
    if (allCurrentSelected) {
      const pageIds = paginatedInvoices.map((i) => i.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedInvoices.map((i) => i.id);
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Export CSV function
  function handleExportCsv() {
    const rowsToExport =
      selectedIds.length > 0
        ? invoices.filter((i) => selectedIds.includes(i.id))
        : filteredInvoices;

    if (rowsToExport.length === 0) {
      toast.error("Không có hóa đơn nào để xuất");
      return;
    }

    const headers = [
      "Kỳ",
      "Phòng",
      "Tầng",
      "Khách thuê",
      "Số điện thoại",
      "Tiền phòng",
      "Điện (kWh)",
      "Tiền điện",
      "Nước (m3)",
      "Tiền nước",
      "Phí khác",
      "Tổng tiền",
      "Đã thanh toán",
      "Còn nợ",
      "Trạng thái",
      "Hạn đóng",
    ];

    const lines = rowsToExport.map((i) => {
      const remaining = i.total - i.paidAmount;
      return [
        `"${i.period}"`,
        `"${i.roomName}"`,
        `"${i.floor ?? ""}"`,
        `"${i.tenantName ?? ""}"`,
        `"${i.tenantPhone ?? ""}"`,
        i.roomFee,
        i.electricUsage,
        i.electricAmount,
        i.waterUsage,
        i.waterAmount,
        i.otherFee,
        i.total,
        i.paidAmount,
        remaining,
        `"${i.status === "paid" ? "Đã thu" : i.status === "partial" ? "Một phần" : "Chưa thu"}"`,
        `"${i.dueDate}"`,
      ].join(",");
    });

    const csvContent = `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Danh_sach_hoa_don_${selectedPeriod !== "all" ? selectedPeriod : "tat_ca"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${rowsToExport.length} hóa đơn ra file CSV`);
  }

  // Quick Pay Submit
  function handleQuickPay(method: "cash" | "transfer", customAmount?: number) {
    if (!quickPayInvoice) return;
    startTransition(async () => {
      const res = await recordQuickPayment(propertyId, quickPayInvoice.id, method, customAmount);
      if (!res.ok) {
        toast.error("Không thể ghi nhận thanh toán");
        return;
      }
      toast.success(`Đã thu tiền hóa đơn phòng ${quickPayInvoice.roomName}!`);
      setQuickPayInvoice(null);
      router.refresh();
    });
  }

  // Bulk Pay Submit
  function handleBulkPay(method: "cash" | "transfer") {
    if (selectedIds.length === 0) return;
    if (
      !confirm(`Xác nhận ghi nhận thanh toán toàn bộ cho ${selectedIds.length} hóa đơn đã chọn?`)
    ) {
      return;
    }

    startTransition(async () => {
      const res = await recordBulkPayments(propertyId, selectedIds, method);
      if (!res.ok) {
        toast.error("Có lỗi khi thanh toán hàng loạt");
        return;
      }
      toast.success(`Đã ghi nhận thanh toán cho ${res.data.paidCount} hóa đơn!`);
      setSelectedIds([]);
      router.refresh();
    });
  }

  // Bulk Reminder Copy
  function handleBulkReminderCopy() {
    const selectedInvoices = invoices.filter((i) => selectedIds.includes(i.id));
    if (selectedInvoices.length === 0) return;

    const messages = selectedInvoices.map((i) => {
      const remaining = i.total - i.paidAmount;
      return `[${propertyName}] Kính gửi bạn ${i.tenantName || i.roomName}: Hóa đơn tiền phòng tháng ${formatPeriodShort(i.period)} là ${formatMoney(remaining)} (Hạn đóng: ${formatDate(i.dueDate)}). Vui lòng thanh toán sớm. Cảm ơn bạn!`;
    });

    navigator.clipboard.writeText(messages.join("\n\n---\n\n"));
    toast.success(
      `Đã sao chép tin nhắn nhắc nợ của ${selectedInvoices.length} phòng vào clipboard!`,
    );
  }

  // Delete invoice
  function handleDeleteInvoice(invoice: InvoiceListItem) {
    if (invoice.paidAmount > 0) {
      if (
        !confirm(
          `Hóa đơn này đã có thanh toán (${formatMoney(invoice.paidAmount)}). Bạn có chắc chắn muốn hủy?`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Hủy hóa đơn phòng ${invoice.roomName} kỳ ${invoice.period}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteInvoice(propertyId, invoice.id);
      if (!res.ok) {
        toast.error("Không thể hủy hóa đơn");
        return;
      }
      toast.success(`Đã hủy hóa đơn phòng ${invoice.roomName}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Tổng phải thu */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng phải thu</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-foreground">
            {formatMoney(summary.totalMustPay)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {summary.totalInvoices} hóa đơn{" "}
            {selectedPeriod !== "all" ? `kỳ ${formatPeriodShort(selectedPeriod)}` : "toàn bộ"}
          </div>
        </div>

        {/* Đã thu */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã thu</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatMoney(summary.totalPaid)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {summary.paidPercent}%
            </span>
            <span>tiến độ thu tiền</span>
          </div>
        </div>

        {/* Còn nợ / Chưa thu */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Còn nợ / Chưa thu</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock size={15} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {formatMoney(summary.totalRemaining)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {summary.unpaidCount} phòng chưa thu đủ
          </div>
        </div>

        {/* Quá hạn */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Quá hạn thanh toán</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
            {formatMoney(summary.overdueAmount)}
          </div>
          <div className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
            {summary.overdueCount} hóa đơn trễ hạn
          </div>
        </div>
      </div>

      {/* 2. Top Action Bar & Multifaceted Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { label: "Tất cả", value: "all" },
              { label: "Chưa thu", value: "unpaid" },
              { label: "Quá hạn", value: "overdue" },
              { label: "Đã thu", value: "paid" },
              { label: "Một phần", value: "partial" },
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Action Buttons (Top Right) */}
          {!isTenant ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5"
                title="Xuất bảng kê hóa đơn CSV / Excel"
              >
                <FileSpreadsheet size={15} className="text-emerald-600" />
                <span className="hidden sm:inline">Xuất CSV</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBatchModal(true)}
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                title="Chốt điện nước và tạo hóa đơn cho tất cả các phòng"
              >
                <Gauge size={15} />
                <span>Chốt điện nước / Lập hàng loạt</span>
              </Button>

              <Link
                href="/rooms"
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "gap-1.5")}
              >
                <Plus size={15} />
                <span>+ Lập hóa đơn mới</span>
              </Link>
            </div>
          ) : null}
        </div>

        {/* Search and Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
          {/* Search box */}
          <div className="relative sm:col-span-6 lg:col-span-5">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Tìm theo số phòng, tên khách thuê, SĐT..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {/* Period Selector */}
          <div className="sm:col-span-3 lg:col-span-4">
            <Select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs"
            >
              <option value="all">Tất cả các tháng / kỳ</option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  Kỳ {formatPeriodShort(p)} ({p})
                </option>
              ))}
            </Select>
          </div>

          {/* Floor Selector */}
          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs"
            >
              <option value="all">Tất cả tầng</option>
              {floors.map((f) => (
                <option key={f} value={f.toString()}>
                  Tầng {f}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Invoices Table & Data */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="Không tìm thấy hóa đơn"
          description={
            invoices.length === 0
              ? "Chưa có hóa đơn nào được phát hành."
              : "Không có hóa đơn nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại."
          }
          action={
            searchTerm ||
            selectedPeriod !== "all" ||
            statusFilter !== "all" ||
            selectedFloor !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPeriod("all");
                  setSelectedFloor("all");
                  setStatusFilter("all");
                }}
              >
                Đặt lại bộ lọc
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {!isTenant ? (
                      <th className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          aria-label="Chọn tất cả hóa đơn trên trang"
                          checked={allCurrentSelected}
                          onChange={toggleSelectAll}
                          className="rounded border-border"
                        />
                      </th>
                    ) : null}
                    <th className="px-4 py-3">Kỳ hóa đơn</th>
                    <th className="px-4 py-3">Phòng & Khách thuê</th>
                    <th className="px-4 py-3">Hạn đóng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                    <th className="px-4 py-3 text-right">Đã trả / Còn nợ</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedInvoices.map((r) => {
                    const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
                    const remaining = Math.max(0, r.total - r.paidAmount);
                    const isSelected = selectedIds.includes(r.id);

                    return (
                      <tr
                        key={r.id}
                        className={cn(
                          "h-14 transition-colors hover:bg-muted/30",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        {/* Checkbox */}
                        {!isTenant ? (
                          <td className="px-4 text-center">
                            <input
                              type="checkbox"
                              aria-label={`Chọn hóa đơn phòng ${r.roomName}`}
                              checked={isSelected}
                              onChange={() => toggleSelectOne(r.id)}
                              className="rounded border-border"
                            />
                          </td>
                        ) : null}

                        {/* Period */}
                        <td className="px-4">
                          <Link
                            href={`/invoices/${r.id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors focus-visible:underline"
                          >
                            {formatPeriodShort(r.period)}
                          </Link>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {r.period}
                          </div>
                        </td>

                        {/* Room & Tenant Name */}
                        <td className="px-4">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <span>{r.roomName}</span>
                            {r.floor ? (
                              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-normal text-muted-foreground">
                                T{r.floor}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground truncate max-w-[130px]">
                              {r.tenantName ?? "Chưa có tên"}
                            </span>
                            {r.tenantPhone ? (
                              <a
                                href={`tel:${r.tenantPhone}`}
                                className="font-mono text-[10px] text-primary hover:underline"
                                title="Gọi điện cho khách"
                              >
                                {r.tenantPhone}
                              </a>
                            ) : null}
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 font-mono text-muted-foreground">
                          {formatDate(r.dueDate)}
                        </td>

                        {/* Status */}
                        <td className="px-4">
                          <StatusBadge kind={dispStatus} />
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 text-right font-mono font-bold tabular-nums text-foreground">
                          {formatMoney(r.total)}
                        </td>

                        {/* Paid / Remaining */}
                        <td className="px-4 text-right tabular-nums">
                          {remaining === 0 ? (
                            <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                              Đã thu đủ 100%
                            </div>
                          ) : (
                            <div>
                              <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                Nợ: {formatMoney(remaining)}
                              </div>
                              {r.paidAmount > 0 ? (
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  (Đã trả {formatMoney(r.paidAmount)})
                                </div>
                              ) : null}
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Detail */}
                            <Link
                              href={`/invoices/${r.id}`}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "size-8 p-0 text-muted-foreground hover:text-foreground",
                              )}
                              title="Xem chi tiết hóa đơn"
                            >
                              <Eye size={15} />
                            </Link>

                            {/* Quick Pay */}
                            {!isTenant && remaining > 0 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setQuickPayInvoice(r)}
                                className="size-8 p-0 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                title="Thu tiền nhanh"
                              >
                                <Banknote size={15} />
                              </Button>
                            ) : null}

                            {/* Reminder text */}
                            {!isTenant && remaining > 0 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setReminderInvoice(r)}
                                className="size-8 p-0 text-sky-600 hover:bg-sky-500/10 hover:text-sky-700"
                                title="Mẫu tin nhắn nhắc nợ (Zalo/SMS)"
                              >
                                <MessageSquare size={15} />
                              </Button>
                            ) : null}

                            {/* Delete */}
                            {!isTenant ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvoice(r)}
                                className="size-8 p-0 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                                title="Hủy hóa đơn"
                              >
                                <Trash2 size={15} />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {paginatedInvoices.map((r) => {
              const dispStatus = invoiceDisplayStatus(r.status, r.dueDate, today);
              const remaining = Math.max(0, r.total - r.paidAmount);
              const isSelected = selectedIds.includes(r.id);

              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-colors",
                    isSelected && "border-primary/60 bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isTenant ? (
                        <input
                          type="checkbox"
                          aria-label={`Chọn phòng ${r.roomName}`}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(r.id)}
                          className="rounded border-border mt-0.5"
                        />
                      ) : null}
                      <div>
                        <Link
                          href={`/invoices/${r.id}`}
                          className="font-bold text-base text-foreground hover:underline"
                        >
                          {r.roomName} · {formatPeriodShort(r.period)}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span>{r.tenantName || "Chưa có tên"}</span>
                          {r.tenantPhone ? (
                            <a href={`tel:${r.tenantPhone}`} className="text-primary font-mono">
                              ({r.tenantPhone})
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <StatusBadge kind={dispStatus} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-b border-border/40 py-2.5 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Tổng cộng:</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {formatMoney(r.total)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Còn nợ:</span>
                      <span
                        className={cn(
                          "font-mono font-bold text-sm",
                          remaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600",
                        )}
                      >
                        {remaining > 0 ? formatMoney(remaining) : "0 ₫ (Đã đủ)"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Hạn: {formatDate(r.dueDate)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isTenant && remaining > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQuickPayInvoice(r)}
                          className="h-8 gap-1 text-emerald-600 border-emerald-500/30"
                        >
                          <Banknote size={14} />
                          <span>Thu tiền</span>
                        </Button>
                      ) : null}

                      {!isTenant && remaining > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReminderInvoice(r)}
                          className="h-8 size-8 p-0 text-sky-600"
                          title="Nhắc nợ"
                        >
                          <MessageSquare size={14} />
                        </Button>
                      ) : null}

                      <Link
                        href={`/invoices/${r.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 size-8 p-0",
                        )}
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredInvoices.length)}
                </span>{" "}
                của <span className="font-semibold text-foreground">{filteredInvoices.length}</span>{" "}
                hóa đơn
              </span>

              <div className="flex items-center gap-1 ml-2">
                <span>/ trang:</span>
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 text-xs w-16 px-1 py-0"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Trước</span>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsis ? (
                        <span className="px-1 text-muted-foreground">...</span>
                      ) : null}
                      <Button
                        type="button"
                        variant={page === p ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="h-8 w-8 p-0"
                      >
                        {p}
                      </Button>
                    </div>
                  );
                })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Floating Bulk Actions Bar */}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl border border-border/80 bg-card p-2.5 px-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <span className="text-xs font-bold text-primary mr-1 whitespace-nowrap">
            Đã chọn {selectedIds.length} hóa đơn:
          </span>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={pending}
            onClick={() => handleBulkPay("transfer")}
            className="h-8 text-xs gap-1.5"
          >
            <Banknote size={14} />
            <span>Đã thu hết</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBulkReminderCopy}
            className="h-8 text-xs gap-1.5"
            title="Sao chép tin nhắn nhắc nợ hàng loạt cho tất cả các phòng đã chọn"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">Copy tin nhắn nhắc</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs gap-1.5"
            title="Xuất file CSV các mục đã chọn"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Xuất CSV</span>
          </Button>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
            title="Bỏ chọn tất cả"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {/* 6. Batch Invoice Generation Modal */}
      {showBatchModal ? (
        <BatchInvoiceModal
          open={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          propertyId={propertyId}
          period={selectedPeriod !== "all" ? selectedPeriod : periods[0] || today.slice(0, 7)}
          candidates={batchContext?.candidates || []}
          electricPrice={batchContext?.electricPrice || 3500}
          waterPrice={batchContext?.waterPrice || 25000}
        />
      ) : null}

      {/* 7. Quick Pay Modal */}
      {quickPayInvoice ? (
        <QuickPayModal
          open={Boolean(quickPayInvoice)}
          onClose={() => setQuickPayInvoice(null)}
          invoice={quickPayInvoice}
          onConfirm={handleQuickPay}
          pending={pending}
        />
      ) : null}

      {/* 8. Reminder Message Modal */}
      {reminderInvoice ? (
        <ReminderModal
          open={Boolean(reminderInvoice)}
          onClose={() => setReminderInvoice(null)}
          propertyName={propertyName}
          invoice={reminderInvoice}
        />
      ) : null}
    </div>
  );
}

// Sub-component: Quick Pay Modal
function QuickPayModal({
  open,
  onClose,
  invoice,
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceListItem;
  onConfirm: (method: "cash" | "transfer", amount?: number) => void;
  pending: boolean;
}) {
  const remaining = Math.max(0, invoice.total - invoice.paidAmount);
  const [method, setMethod] = useState<"cash" | "transfer">("transfer");
  const [amount, setAmount] = useState<number>(remaining);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Banknote size={18} className="text-emerald-600" />
            <span>Thu tiền nhanh - Phòng {invoice.roomName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="rounded-lg bg-muted/40 p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kỳ hóa đơn:</span>
              <span className="font-semibold text-foreground">
                {formatPeriodShort(invoice.period)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khách thuê:</span>
              <span className="font-semibold text-foreground">
                {invoice.tenantName ?? "Chưa có tên"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng hóa đơn:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatMoney(invoice.total)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/40">
              <span className="font-bold text-foreground">Số tiền còn nợ:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(remaining)}
              </span>
            </div>
          </div>

          <div>
            <p className="block font-semibold text-foreground mb-1">Hình thức thanh toán</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("transfer")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-2.5 font-medium transition-all",
                  method === "transfer"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <CreditCard size={15} />
                <span>Chuyển khoản</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-2.5 font-medium transition-all",
                  method === "cash"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <Banknote size={15} />
                <span>Tiền mặt</span>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="quick-pay-amount-input"
              className="block font-semibold text-foreground mb-1"
            >
              Số tiền thu thực tế (Mặc định thu đủ)
            </label>
            <Input
              id="quick-pay-amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={remaining}
              min={1000}
              className="font-mono font-bold text-sm h-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={pending || amount <= 0 || amount > remaining}
            onClick={() => onConfirm(method, amount)}
          >
            {pending ? "Đang lưu..." : `Xác nhận thu ${formatMoney(amount)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Reminder Message Modal
function ReminderModal({
  open,
  onClose,
  propertyName,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  propertyName: string;
  invoice: InvoiceListItem;
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const remaining = Math.max(0, invoice.total - invoice.paidAmount);
  const message =
    `[${propertyName}] Kính gửi bạn ${invoice.tenantName || invoice.roomName},\n` +
    `Nhà trọ xin gửi bảng kê tiền phòng tháng ${formatPeriodShort(invoice.period)}:\n` +
    `- Tiền phòng: ${formatMoney(invoice.roomFee)}\n` +
    `- Tiền điện (${invoice.electricUsage} kWh): ${formatMoney(invoice.electricAmount)}\n` +
    `- Tiền nước (${invoice.waterUsage} m³): ${formatMoney(invoice.waterAmount)}\n` +
    (invoice.otherFee > 0 ? `- Phí dịch vụ khác: ${formatMoney(invoice.otherFee)}\n` : "") +
    `👉 TỔNG TIỀN PHẢI ĐÓNG: ${formatMoney(remaining)}\n` +
    `📅 Hạn thanh toán: ngày ${formatDate(invoice.dueDate)}.\n\n` +
    `Quý khách vui lòng chuyển khoản theo thông tin số tài khoản của nhà trọ hoặc đóng trực tiếp. Xin cảm ơn!`;

  function copyText() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Đã sao chép nội dung tin nhắn nhắc nợ!");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <MessageSquare size={18} className="text-sky-600" />
            <span>Mẫu tin nhắn nhắc nợ (Zalo / SMS)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Nội dung đã được tạo sẵn theo chi tiết hóa đơn phòng {invoice.roomName}. Bạn có thể sao
            chép và gửi trực tiếp qua Zalo hoặc tin nhắn cho khách thuê:
          </p>
          <textarea
            readOnly
            rows={10}
            value={message}
            className="w-full rounded-xl border border-border/80 bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground select-all focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {invoice.tenantPhone ? (
              <a
                href={`sms:${invoice.tenantPhone}?body=${encodeURIComponent(message)}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Send size={14} className="mr-1.5" />
                Mở ứng dụng SMS
              </a>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={copyText}
              className="gap-1.5"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? "Đã sao chép" : "Sao chép tin nhắn"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
