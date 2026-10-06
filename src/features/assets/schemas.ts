import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const assetSchema = z.object({
  roomId: z.string().uuid(),
  name: z.string().trim().min(1, "required").max(100),
  category: z.enum(["electrical", "furniture", "sanitary", "security", "other"]),
  quantity: z.number().int().min(1),
  condition: z.enum(["new", "good", "fair", "damaged"]),
  serialNumber: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(255).nullable().optional(),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const handoverItemSchema = z.object({
  assetName: z.string().min(1),
  condition: z.string(),
  quantity: z.number().int(),
  notes: z.string().optional(),
});

export const handoverSchema = z.object({
  contractId: z.string().uuid(),
  roomId: z.string().uuid(),
  type: z.enum(["checkin", "checkout"]),
  handoverDate: isoDate,
  items: z.array(handoverItemSchema),
  photos: z.array(z.string()),
  notes: z.string().trim().max(1000).nullable().optional(),
  signedByTenant: z.enum(["yes", "no"]),
});
export type HandoverInput = z.infer<typeof handoverSchema>;
