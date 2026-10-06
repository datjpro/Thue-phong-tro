import { z } from "zod";

export const tenantSchema = z.object({
  fullName: z.string().trim().min(1, "required").max(100),
  phone: z.string().trim().max(20).optional().nullable(),
  idNumber: z.string().trim().max(20).optional().nullable(),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate")
    .optional()
    .nullable()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  hometown: z.string().trim().max(255).optional().nullable(),
  workplace: z.string().trim().max(255).optional().nullable(),
  licensePlate: z.string().trim().max(50).optional().nullable(),
  idCardFrontUrl: z.string().optional().nullable(),
  idCardBackUrl: z.string().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});
export type TenantInput = z.infer<typeof tenantSchema>;
