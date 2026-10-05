import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const contractSchema = z.object({
  roomId: z.string().uuid(),
  tenantIds: z.array(z.string().uuid()).min(1), // người đầu tiên là người đại diện
  startDate: isoDate,
  rentPrice: z.number().int().min(1).max(1_000_000_000),
  deposit: z.number().int().min(0).max(1_000_000_000),
  // Chỉ số đồng hồ lúc bắt đầu; bị bỏ qua nếu phòng đã có lịch sử chỉ số.
  initialElectric: z.number().int().min(0),
  initialWater: z.number().int().min(0),
});
export type ContractInput = z.infer<typeof contractSchema>;

export const endContractSchema = z.object({
  contractId: z.string().uuid(),
  endDate: isoDate,
});
export type EndContractInput = z.infer<typeof endContractSchema>;
