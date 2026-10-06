import { z } from "zod";

export const chargeTypeEnum = z.enum(["fixed_room", "per_person", "per_vehicle", "per_usage"]);
export type ChargeType = z.infer<typeof chargeTypeEnum>;

export const serviceSchema = z.object({
  name: z.string().min(1, "Tên dịch vụ không được để trống").max(100),
  chargeType: chargeTypeEnum.default("fixed_room"),
  unitPrice: z.number().int().min(0, "Đơn giá không được âm"),
  description: z.string().max(255).optional().nullable(),
  isActive: z.enum(["yes", "no"]).default("yes"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const contractServiceItemSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  customPrice: z.number().int().min(0).optional().nullable(),
});

export const saveContractServicesSchema = z.object({
  contractId: z.string().uuid(),
  items: z.array(contractServiceItemSchema),
});

export type SaveContractServicesInput = z.infer<typeof saveContractServicesSchema>;
