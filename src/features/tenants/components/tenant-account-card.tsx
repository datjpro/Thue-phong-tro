"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { provisionTenantAccount } from "../actions";
import { formatTenantUsername } from "../utils";

type TenantAccountCardProps = {
  propertyId: string;
  roomId: string;
  roomName: string;
  tenant: {
    id: string;
    fullName: string;
    phone: string | null;
    idNumber: string | null;
    userId: string | null;
  };
};

export function TenantAccountCard({
  propertyId,
  roomId,
  roomName,
  tenant,
}: TenantAccountCardProps) {
  const [isPending, startTransition] = useTransition();
  const [hasAccount, setHasAccount] = useState(Boolean(tenant.userId));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const username = formatTenantUsername(roomName);
  const password = tenant.idNumber?.trim() || "";

  function handleCopy(text: string, fieldName: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handleProvision() {
    if (!tenant.idNumber) {
      toast.error("Người thuê chưa có số CCCD. Vui lòng cập nhật CCCD trước khi cấp tài khoản.");
      return;
    }

    startTransition(async () => {
      const res = await provisionTenantAccount(propertyId, tenant.id, roomId);
      if (res.ok) {
        setHasAccount(true);
        toast.success(`Đã cấp tài khoản phòng ${username} thành công!`);
      } else {
        if (res.error === "missingIdNumber") {
          toast.error("Thiếu số CCCD của người thuê để làm mật khẩu.");
        } else {
          toast.error("Không thể cấp tài khoản. Vui lòng thử lại sau.");
        }
      }
    });
  }

  return (
    <div className="rounded-[10px] border border-suong bg-mat p-4 transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-suong/60">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-la/10 text-la">
            <KeyRound size={15} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muc">Tài khoản người thuê</h3>
            <p className="text-xs text-muc-phu">Đăng nhập cổng người thuê</p>
          </div>
        </div>

        {hasAccount ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-la/10 px-2.5 py-0.5 text-xs font-medium text-la">
            <UserCheck size={12} strokeWidth={2} aria-hidden="true" />
            Đã cấp
          </span>
        ) : (
          <span className="text-xs text-muc-phu">Chưa kích hoạt</span>
        )}
      </div>

      {hasAccount ? (
        <div className="mt-3 space-y-2.5 text-xs">
          {/* Tên đăng nhập / Số phòng */}
          <div className="flex items-center justify-between rounded-md bg-giay px-3 py-2 border border-suong/40">
            <span className="text-muc-phu">Tên đăng nhập (Số phòng):</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muc tabular-nums font-mono">{username}</span>
              <button
                type="button"
                onClick={() => handleCopy(username, "tên đăng nhập")}
                className="text-muc-phu hover:text-la transition-colors"
                title="Sao chép tên đăng nhập"
                aria-label="Sao chép tên đăng nhập"
              >
                {copiedField === "tên đăng nhập" ? (
                  <Check size={13} className="text-la" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>

          {/* Mật khẩu / CCCD */}
          <div className="flex items-center justify-between rounded-md bg-giay px-3 py-2 border border-suong/40">
            <span className="text-muc-phu">Mật khẩu (Số CCCD):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-semibold text-muc tabular-nums font-mono hover:text-la transition-colors"
                title="Nhấp để ẩn/hiện mật khẩu"
                aria-label="Ẩn hiện mật khẩu"
              >
                {password ? (showPassword ? password : "••••••••••••") : "Chưa có CCCD"}
              </button>
              {password ? (
                <button
                  type="button"
                  onClick={() => handleCopy(password, "mật khẩu")}
                  className="text-muc-phu hover:text-la transition-colors"
                  title="Sao chép mật khẩu"
                  aria-label="Sao chép mật khẩu"
                >
                  {copiedField === "mật khẩu" ? (
                    <Check size={13} className="text-la" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              ) : null}
            </div>
          </div>

          <p className="text-[11px] text-muc-phu italic pt-0.5">
            Khách thuê đăng nhập bằng số phòng{" "}
            <strong className="text-muc not-italic">{username}</strong> và mật khẩu là số CCCD.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3 text-xs">
          <p className="text-muc-phu leading-relaxed">
            Cấp tài khoản cho <strong className="text-muc">{tenant.fullName}</strong>. Tên đăng nhập
            là số phòng (<strong>{username}</strong>) và mật khẩu là số CCCD (
            <strong>{tenant.idNumber || "Chưa có CCCD"}</strong>).
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleProvision}
            disabled={isPending || !tenant.idNumber}
            className="w-full text-xs font-medium"
          >
            {isPending ? "Đang cấp tài khoản..." : "Cấp tài khoản người thuê"}
          </Button>
          {!tenant.idNumber ? (
            <p className="text-[11px] text-nghe font-medium">
              ⚠️ Cần cập nhật số CCCD của người thuê trước khi cấp tài khoản.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
