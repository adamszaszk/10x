import { z } from "zod";

export const GeneratePlanCommandSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export const GeneratedPlanDtoSchema = z.object({
  destination_name: z.string(),
  plan_data: z.object({
    introduction: z.string(),
    why_visit: z.string(),
    things_to_do: z.string(),
    sample_itinerary: z.string(),
  }),
  disclaimer: z.string(),
});
