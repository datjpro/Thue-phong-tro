import { z } from "zod";

export const feedbackCategories = [
  {
    id: "noise",
    label: "Tiếng ồn / Giờ giấc",
    icon: "Volume2",
    desc: "Phòng bên làm ồn, hát hò, tụ tập khuya...",
  },
  {
    id: "cleanliness",
    label: "Vệ sinh / Rác thải",
    icon: "Trash2",
    desc: "Rác để bừa bãi, mùi hôi, hành lang bẩn...",
  },
  {
    id: "security",
    label: "An ninh & Nội quy",
    icon: "ShieldAlert",
    desc: "Quên khóa cổng, người lạ, đỗ xe lấn lối...",
  },
  {
    id: "facility",
    label: "Sửa chữa thiết bị",
    icon: "Wrench",
    desc: "Hỏng đèn, rò rỉ nước, máy lạnh, cống...",
  },
  {
    id: "other",
    label: "Góp ý & Khác",
    icon: "MessageSquare",
    desc: "Góp ý dịch vụ hoặc thắc mắc khác...",
  },
] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number]["id"];

export const maintenanceSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề phản ánh").max(150),
  description: z.string().trim().max(1000),
  category: z.enum(["facility", "noise", "cleanliness", "security", "other"]),
  priority: z.enum(["low", "normal", "urgent"]),
  isAnonymous: z.enum(["yes", "no"]),
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const maintenanceStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "done", "rejected"]),
  cost: z.number().int().min(0).default(0),
  response: z.string().trim().max(1000).optional(),
});
export type MaintenanceStatusInput = z.infer<typeof maintenanceStatusSchema>;
