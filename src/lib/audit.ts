import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export type AuditAction =
  | "login"
  | "create_room"
  | "update_room_status"
  | "update_bed_status"
  | "create_tenant"
  | "grant_tenant_account"
  | "create_contract"
  | "end_contract"
  | "create_invoice"
  | "delete_invoice"
  | "record_payment"
  | "undo_payment"
  | "update_settings"
  | "create_maintenance"
  | "update_maintenance_status"
  | "create_room_asset"
  | "save_asset_handover"
  | "change_password";

export interface LogAuditParams {
  propertyId: string;
  userId: string;
  action: AuditAction;
  resourceType:
    | "room"
    | "tenant"
    | "contract"
    | "invoice"
    | "payment"
    | "property"
    | "maintenance"
    | "asset"
    | "asset_handover"
    | "auth";
  resourceId?: string;
  details?: Record<string, unknown>;
}

/**
 * Ghi lại lịch sử hoạt động và sự kiện an ninh hệ thống (Audit Log).
 * Tự động trích xuất IP và User-Agent từ request headers.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const h = await headers();
      ipAddress =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "127.0.0.1";
      userAgent = h.get("user-agent") ?? "Unknown";
    } catch {
      // Khi gọi từ background hoặc context không có headers
    }

    await db.insert(auditLogs).values({
      propertyId: params.propertyId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Không để lỗi ghi log làm gián đoạn nghiệp vụ chính nhưng log ra console
    console.error("Lỗi khi ghi audit log:", error);
  }
}
