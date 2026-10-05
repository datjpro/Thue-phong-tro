import type { BadgeKind } from "@/components/shared/status-badge";

/** Quá hạn là trạng thái suy ra từ hạn đóng, không lưu trong DB. */
export function invoiceDisplayStatus(
  status: "unpaid" | "partial" | "paid",
  dueDate: string,
  today: string,
): BadgeKind {
  if (status !== "paid" && dueDate < today) return "overdue";
  return status;
}
