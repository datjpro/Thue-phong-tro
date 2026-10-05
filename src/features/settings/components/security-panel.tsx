"use client";

import {
  CheckCircle2,
  Database,
  History,
  KeyRound,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/dates";

interface AuditLogItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  userName: string | null;
}

interface SecurityPanelProps {
  propertyId: string;
  auditLogs: AuditLogItem[];
  isTenant: boolean;
}

export function SecurityPanel({ auditLogs, isTenant }: SecurityPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  const actionLabels: Record<string, string> = {
    login: "Đăng nhập",
    create_room: "Thêm phòng mới",
    create_tenant: "Thêm người thuê",
    grant_tenant_account: "Cấp tài khoản portal",
    create_contract: "Lập hợp đồng mới",
    end_contract: "Kết thúc hợp đồng",
    create_invoice: "Chốt số & Lập hóa đơn",
    record_payment: "Ghi nhận thanh toán",
    undo_payment: "Hoàn tác thanh toán",
    update_settings: "Cập nhật giá & thiết lập",
    create_maintenance: "Báo hỏng / Sửa chữa",
    update_maintenance_status: "Cập nhật tiến độ sửa",
    change_password: "Đổi mật khẩu",
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield size={16} />
          <span>Lớp bảo mật hệ thống</span>
        </button>
        {!isTenant ? (
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History size={16} />
            <span>Nhật ký an ninh ({auditLogs.length})</span>
          </button>
        ) : null}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Feature 1: Chống can thiệp F12 / DevTools */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                <ShieldCheck size={18} />
                <span>Chống can thiệp F12 (DevTools)</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Mọi đơn giá, số tiền, trạng thái hợp đồng và phân quyền đều được{" "}
                <strong className="text-foreground font-semibold">
                  tính toán & xác thực trực tiếp tại Server
                </strong>
                . Người dùng không thể sửa giá trị qua F12 Console hoặc can thiệp network request.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                <CheckCircle2 size={13} />
                <span>Zero-Trust Server Action Validation</span>
              </div>
            </div>

            {/* Feature 2: Mã hóa AES-256-GCM */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
                <Lock size={18} className="text-primary" />
                <span>Mã hóa dữ liệu AES-256-GCM</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Dữ liệu định danh, mật khẩu được băm 1 chiều (scrypt/argon2), dữ liệu nhạy cảm được
                bảo vệ bởi thuật toán mã hóa đối xứng chuẩn quân đội AES-256 kèm IV ngẫu nhiên.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                <CheckCircle2 size={13} />
                <span>Data Encryption at Rest & In-Transit</span>
              </div>
            </div>

            {/* Feature 3: Rate Limiting & Anti-Brute Force */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
                <KeyRound size={18} className="text-primary" />
                <span>Giới hạn tần suất (Rate Limiting)</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Hệ thống tự động phát hiện và ngăn chặn các hành vi spam request, chạy script lặp
                hoặc thử dò mật khẩu (Brute-Force Attack) từ công cụ tự động.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                <CheckCircle2 size={13} />
                <span>Tự động chặn IP/User nghi vấn</span>
              </div>
            </div>

            {/* Feature 4: HTTP Security Headers & CSP */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
                <Database size={18} className="text-primary" />
                <span>Bảo vệ CSP & Clickjacking</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Kích hoạt đầy đủ các chuẩn bảo mật:{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                  X-Frame-Options: DENY
                </code>
                , <code className="bg-muted px-1 py-0.5 rounded text-[11px]">CSP</code>,{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px]">HSTS</code>, chống mã độc
                XSS và chèn iframe đánh cắp phiên.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                <CheckCircle2 size={13} />
                <span>Chuẩn bảo mật OWASP Top 10</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs List */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">
              Lịch sử các hoạt động an ninh gần nhất
            </h4>
            <span className="text-xs text-muted-foreground">Tự động ghi nhận thời gian thực</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
              <ShieldAlert className="mx-auto size-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">Chưa có nhật ký hoạt động nào</p>
              <p className="text-xs text-muted-foreground mt-1">
                Các thao tác thêm phòng, hợp đồng, thu tiền sẽ được tự động lưu vết tại đây.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {actionLabels[log.action] ?? log.action}
                      </span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-primary">
                        {log.resourceType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Bởi: {log.userName ?? "Hệ thống"}</span>
                      {log.ipAddress ? (
                        <span>
                          · IP: <code className="font-mono text-[11px]">{log.ipAddress}</code>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
