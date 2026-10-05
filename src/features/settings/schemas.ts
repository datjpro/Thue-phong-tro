import { z } from "zod";

export const propertySettingsSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  electricPrice: z.number().int().min(0).max(100_000),
  waterPrice: z.number().int().min(0).max(1_000_000),
  dueDay: z.number().int().min(1).max(28),
});
export type PropertySettingsInput = z.infer<typeof propertySettingsSchema>;
