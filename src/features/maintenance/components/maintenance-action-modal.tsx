"use client";

import { CheckCircle2, Edit3, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { deleteMaintenance, updateMaintenanceStatus } from "../actions";
import type { MaintenanceItem } from "../queries";

interface Props {
  propertyId: string;
  item: MaintenanceItem;
}

export function MaintenanceActionModal({ propertyId, item }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<MaintenanceItem["status"]>(item.status || "open");
  const [cost, setCost] = useState<number>(item.cost ?? 0);
  const [response, setResponse] = useState<string>(item.response ?? "");

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateMaintenanceStatus(propertyId, {
        id: item.id,
        status,
        cost,
        response,
      });
      if (res.ok) {
        toast.success("Đã cập nhật trạng thái và phản hồi");
        setOpen(false);
      } else {
        toast.error("Không thể cập nhật, vui lòng thử lại");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản ánh này không?")) return;
    startTransition(async () => {
      const res = await deleteMaintenance(propertyId, item.id);
      if (res.ok) {
        toast.success("Đã xóa phản ánh thành công");
        setOpen(false);
      } else {
        toast.error("Không thể xóa, vui lòng thử lại");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-1.5 text-xs font-semibold"
      >
        <Edit3 size={13} />
        <span>Xử lý & Phản hồi</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xử lý phản ánh / Báo sửa chữa</DialogTitle>
            <DialogDescription className="text-xs">
              Cập nhật tiến độ xử lý và gửi phản hồi đến người thuê phòng {item.roomName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border border-border/50">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>{item.title}</span>
                <span className="text-muted-foreground">{item.roomName}</span>
              </div>
              {item.description ? (
                <p className="text-muted-foreground">{item.description}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="status-select"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Trạng thái xử lý
              </label>
              <select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceItem["status"])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="open">⏳ Mới tiếp nhận (Chưa xử lý)</option>
                <option value="in_progress">🔄 Đang xử lý / Đã nhắc nhở / Đang sửa</option>
                <option value="done">✅ Đã hoàn tất xử lý</option>
                <option value="rejected">❌ Từ chối / Không hợp lệ</option>
              </select>
            </div>

            {item.category === "facility" ? (
              <div>
                <label
                  htmlFor="cost-input"
                  className="text-xs font-semibold text-foreground block mb-1"
                >
                  Chi phí sửa chữa phát sinh (₫ nếu có)
                </label>
                <Input
                  id="cost-input"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="response-text"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Nội dung phản hồi / Cách giải quyết cho người thuê
              </label>
              <Textarea
                id="response-text"
                rows={3}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Ví dụ: Đã nhắc nhở phòng 202 giữ yên tĩnh sau 22h; hoặc: Đã hẹn thợ đến kiểm tra vào sáng mai..."
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Người thuê phòng sẽ thấy nội dung phản hồi này khi mở xem yêu cầu.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
                className="gap-1 text-xs"
              >
                <Trash2 size={13} />
                <span>Xóa</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSave}
                  className="gap-1 text-xs"
                >
                  {isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Lưu kết quả</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
