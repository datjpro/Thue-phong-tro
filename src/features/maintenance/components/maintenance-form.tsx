"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type LucideIcon,
  MessageSquare,
  Plus,
  ShieldAlert,
  Trash2,
  Volume2,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSubmit } from "@/lib/use-submit";
import { createMaintenance } from "../actions";
import {
  type FeedbackCategory,
  type MaintenanceInput,
  feedbackCategories,
  maintenanceSchema,
} from "../schemas";

const QUICK_SUGGESTIONS: Record<FeedbackCategory, string[]> = {
  noise: [
    "Phòng bên mở nhạc / karaoke lớn",
    "Nói chuyện, làm ồn quá 23h đêm",
    "Tụ tập đông người gây mất trật tự",
    "Kéo lê bàn ghế, dậm chân mạnh trên lầu",
  ],
  cleanliness: [
    "Để bọc rác trước cửa phòng gây mùi hôi",
    "Hành lang / cầu thang chung quá bẩn",
    "Vứt tàn thuốc / rác bừa bãi",
    "Nước sinh hoạt có mùi lạ hoặc đục",
  ],
  security: [
    "Cửa cổng chung thường xuyên quên đóng/khóa",
    "Đỗ xe máy chắn lối đi chung / cầu thang",
    "Người lạ ra vào không khóa cổng an ninh",
    "Mất đồ hoặc có dấu hiệu khả nghi",
  ],
  facility: [
    "Cháy bóng đèn phòng / ban công",
    "Rò rỉ nước / hỏng vòi sen / bồn rửa",
    "Tắc nghẽn cống thoát / bồn cầu",
    "Máy lạnh không lạnh / kêu to / chảy nước",
  ],
  other: [
    "Góp ý về mạng Wi-Fi chập chờn",
    "Đề xuất nội quy giữ gìn vệ sinh chung",
    "Thắc mắc về dịch vụ nhà trọ",
  ],
};

const CATEGORY_ICONS: Record<FeedbackCategory, LucideIcon> = {
  noise: Volume2,
  cleanliness: Trash2,
  security: ShieldAlert,
  facility: Wrench,
  other: MessageSquare,
};

export function MaintenanceForm({
  propertyId,
  rooms,
}: {
  propertyId: string;
  rooms: { id: string; name: string }[];
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>("noise");

  const form = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      roomId: rooms[0]?.id ?? "",
      title: "",
      description: "",
      category: "noise",
      priority: "normal",
      isAnonymous: "no",
    },
  });

  const { submit, pending } = useSubmit((v: MaintenanceInput) => createMaintenance(propertyId, v), {
    successKey: "maintenance.created",
    onSuccess: () => {
      form.reset({
        roomId: rooms[0]?.id ?? "",
        title: "",
        description: "",
        category: "noise",
        priority: "normal",
        isAnonymous: "no",
      });
      setSelectedCategory("noise");
      setOpen(false);
    },
  });

  const { errors } = form.formState;

  const handleSelectCategory = (cat: FeedbackCategory) => {
    setSelectedCategory(cat);
    form.setValue("category", cat);
  };

  const handleApplyPreset = (titleText: string) => {
    form.setValue("title", titleText);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={rooms.length === 0}
        variant="primary"
        className="w-full sm:w-auto gap-1.5"
      >
        <Plus size={18} aria-hidden="true" />
        <span>Gửi phản ánh / Báo hỏng</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen} title="Gửi phản ánh & Báo hỏng">
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4 pt-2">
          {/* Chọn phòng */}
          <div>
            <label
              htmlFor="select-room-field"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              {t("contracts.room")}
            </label>
            <Select id="select-room-field" {...form.register("roomId")}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Chọn phân loại phản ánh */}
          <div>
            <span className="text-xs font-semibold text-foreground block mb-1.5">
              Loại vấn đề phản ánh
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {feedbackCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-2.5 rounded-lg border text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs ring-1 ring-primary"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon size={16} />
                      <span className="text-xs">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gợi ý mẫu nhanh */}
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
              Gợi ý phản ánh nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS[selectedCategory]?.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleApplyPreset(text)}
                  className="rounded-md border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                >
                  + {text}
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label
              htmlFor="title-field"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Tiêu đề phản ánh <span className="text-destructive">*</span>
            </label>
            <Input
              id="title-field"
              placeholder="Nhập tóm tắt vấn đề..."
              {...form.register("title")}
            />
            {errors.title ? (
              <p className="text-[11px] text-destructive mt-1">{errors.title.message}</p>
            ) : null}
          </div>

          {/* Chi tiết mô tả */}
          <div>
            <label
              htmlFor="desc-field"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Mô tả chi tiết / Thời gian xảy ra
            </label>
            <Textarea
              id="desc-field"
              rows={3}
              placeholder="Ví dụ: Phòng 201 mở nhạc rất to từ 23h đến 1h sáng, đã nhiều lần nhắc nhở..."
              {...form.register("description")}
            />
          </div>

          {/* Mức độ ưu tiên & Ẩn danh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label
                htmlFor="priority-select"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Mức độ khẩn cấp
              </label>
              <select
                id="priority-select"
                {...form.register("priority")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="normal">⚪ Bình thường</option>
                <option value="urgent">🔴 Khẩn cấp / Cần xử lý gấp</option>
                <option value="low">🟢 Góp ý nhẹ / Thấp</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="anonymous-select"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Bảo mật danh tính
              </label>
              <select
                id="anonymous-select"
                {...form.register("isAnonymous")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="no">Công khai phòng gửi</option>
                <option value="yes">🔒 Ẩn danh (Chỉ chủ trọ biết)</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="min-h-11 mt-3 text-sm font-semibold"
            disabled={pending}
          >
            {pending ? "Đang gửi phản ánh..." : "Gửi yêu cầu & Phản ánh"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
