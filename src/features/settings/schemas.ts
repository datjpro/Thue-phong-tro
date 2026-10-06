import { z } from "zod";

export const propertySettingsSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  address: z.string().trim().max(255).nullish(),
  electricPrice: z.number().int().min(0).max(100_000),
  waterPrice: z.number().int().min(0).max(1_000_000),
  dueDay: z.number().int().min(1).max(28),
  ownerName: z.string().trim().max(100).nullish(),
  ownerBirthDate: z.string().trim().max(50).nullish(),
  ownerIdNumber: z.string().trim().max(20).nullish(),
  ownerIdDate: z.string().trim().max(50).nullish(),
  ownerIdPlace: z.string().trim().max(100).nullish(),
  ownerHometown: z.string().trim().max(255).nullish(),
  ownerPhone: z.string().trim().max(20).nullish(),
});
export type PropertySettingsInput = z.infer<typeof propertySettingsSchema>;
