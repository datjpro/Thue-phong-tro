import { z } from "zod";

export const tenantSchema = z.object({
  fullName: z.string().trim().min(1, "required").max(100),
  phone: z.string().trim().max(20),
  idNumber: z.string().trim().max(20),
});
export type TenantInput = z.infer<typeof tenantSchema>;
