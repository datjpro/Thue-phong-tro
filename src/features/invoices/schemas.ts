import { z } from "zod";

const reading = z.number().int().min(0).max(10_000_000);

export const serviceItemSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().int().min(0),
  quantity: z.number().int().min(1),
});

export const readingSchema = z.object({
  roomId: z.string().uuid(),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  electricCurr: reading,
  waterCurr: reading,
  electricReplaced: z.boolean(),
  waterReplaced: z.boolean(),
  electricPrev: reading,
  waterPrev: reading,
  electricPhoto: z.string().nullable().optional(),
  waterPhoto: z.string().nullable().optional(),
  otherFee: z.number().int().min(0).max(1_000_000_000),
  otherFeeNote: z.string().trim().max(200),
  serviceItems: z.array(serviceItemSchema).optional(),
});
export type ReadingInput = z.infer<typeof readingSchema>;

export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().int().min(1).max(1_000_000_000),
  method: z.enum(["cash", "transfer"]),
});
export type PaymentInput = z.infer<typeof paymentSchema>;
