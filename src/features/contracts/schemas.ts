import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const contractSchema = z.object({
  roomId: z.string().uuid(),
  bedId: z.string().uuid().nullable().optional(),
  tenantIds: z.array(z.string().uuid()).min(1),
  startDate: isoDate,
  endDate: isoDate.nullable().optional().or(z.literal("")),
  rentPrice: z.number().int().min(1).max(1_000_000_000),
  deposit: z.number().int().min(0).max(1_000_000_000),
  billingCycle: z.number().int().min(1).max(24),
  terms: z.string().trim().max(2000).nullable().optional(),
  initialElectric: z.number().int().min(0),
  initialWater: z.number().int().min(0),
});
export type ContractInput = z.infer<typeof contractSchema>;

export const endContractSchema = z.object({
  contractId: z.string().uuid(),
  endDate: isoDate,
});
export type EndContractInput = z.infer<typeof endContractSchema>;
