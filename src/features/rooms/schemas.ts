import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().trim().min(1, "required").max(50),
  floor: z.number().int().min(0).max(100).nullable(),
  area: z.number().int().min(0).max(1000).nullable(),
  rentPrice: z.number().int().min(1, "required").max(1_000_000_000),
  roomType: z.enum(["standard", "dormitory", "sleepbox"]),
  bedCount: z.number().int().min(1).max(50).optional(),
});
export type RoomInput = z.infer<typeof roomSchema>;

export const roomBedSchema = z.object({
  roomId: z.string().uuid(),
  name: z.string().trim().min(1, "required").max(50),
  rentPrice: z.number().int().min(1, "required").max(1_000_000_000),
});
export type RoomBedInput = z.infer<typeof roomBedSchema>;
