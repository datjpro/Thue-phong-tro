import { z } from "zod";

export const maintenanceSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().trim().min(1, "required").max(150),
  description: z.string().trim().max(1000),
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const maintenanceStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "done"]),
});
export type MaintenanceStatusInput = z.infer<typeof maintenanceStatusSchema>;
