"use client";

import { Check, Copy, KeyRound, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { provisionTenantAccount } from "../actions";
import { formatTenantUsername } from "../utils";

type TenantRowAccountButtonProps = {
  propertyId: string;
  tenant: {
    id: string;
    fullName: string;
    phone: string | null;
    idNumber: string | null;
    userId: string | null;
    roomId: string | null;
    roomName: string | null;
  };
};

export function TenantRowAccountButton({ propertyId, tenant }: TenantRowAccountButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [hasAccount, setHasAccount] = useState(Boolean(tenant.userId));
  const [copied, setCopied] = useState(false);

  const username = tenant.roomName ? formatTenantUsername(tenant.roomName) : null;
  const password = tenant.idNumber?.trim() || null;

  function handleCopyCredentials() {
    if (!username || !password) return;
    const info = `Tài khoản: ${username}\nMật khẩu (CCCD): ${password}\nĐăng nhập tại ứng dụng quản lý phòng trọ.`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    toast.success(`Đã sao chép tài khoản phòng ${username}`);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleProvision() {
    const roomId = tenant.roomId;
    if (!roomId) {
      toast.error("Người thuê chưa được gán vào phòng nào.");
      return;
    }
    if (!tenant.idNumber) {
      toast.error("Người thuê chưa có số CCCD. Cần cập nhật CCCD để làm mật khẩu.");
      return;
    }

    startTransition(async () => {
      const res = await provisionTenantAccount(propertyId, tenant.id, roomId);
      if (res.ok) {
        setHasAccount(true);
        toast.success(
          `Đã cấp tài khoản thành công! Tên TK: ${res.data.username} - MK (CCCD): ${res.data.passwordMasked}`,
        );
      } else {
        if (res.error === "missingIdNumber") {
          toast.error("Thiếu số CCCD của người thuê.");
        } else {
          toast.error("Không thể cấp tài khoản. Vui lòng thử lại sau.");
        }
      }
    });
  }

  if (hasAccount && username && password) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end text-[11px] leading-tight">
          <span className="font-semibold text-la flex items-center gap-1">
            <UserCheck size={12} strokeWidth={2} aria-hidden="true" />
            Đã cấp TK: <strong className="font-mono text-muc">{username}</strong>
          </span>
          <span className="text-muc-phu font-mono text-[10px]">
            MK: {password.slice(0, 4)}••••{password.slice(-4)}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyCredentials}
          className="h-8 px-2 text-xs text-muc hover:text-la"
          title="Sao chép thông tin đăng nhập gửi cho khách"
          aria-label="Sao chép tài khoản"
        >
          {copied ? <Check size={13} className="text-la" /> : <Copy size={13} />}
          <span className="hidden sm:inline ml-1">{copied ? "Đã chép" : "Sao chép"}</span>
        </Button>
      </div>
    );
  }

  if (!tenant.roomId) {
    return <span className="text-xs text-muc-phu italic">Chưa gán phòng</span>;
  }

  if (!tenant.idNumber) {
    return <span className="text-xs text-nghe font-medium">Cần bổ sung CCCD</span>;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleProvision}
      disabled={isPending}
      className="h-8 px-3 text-xs font-semibold text-la border-la/40 hover:bg-la/10 hover:text-la transition-colors"
      title={`Cấp tài khoản đăng nhập phòng ${username} (Mật khẩu: CCCD)`}
    >
      <KeyRound size={13} strokeWidth={1.75} className="mr-1 text-la" aria-hidden="true" />
      {isPending ? "Đang cấp..." : "Cấp tài khoản"}
    </Button>
  );
}
