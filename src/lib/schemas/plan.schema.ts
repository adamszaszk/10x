import { z } from "zod";

export const CreatePlanCommandSchema = z.object({
  destination_name: z.string().min(1, "Destination name is required").max(255, "Destination name is too long"),
  plan_data: z.record(z.any()).refine((data) => Object.keys(data).length > 0, {
    message: "Plan data cannot be empty",
  }),
});

export type CreatePlanCommand = z.infer<typeof CreatePlanCommandSchema>;
