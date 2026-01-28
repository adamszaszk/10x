import { z } from "zod";

export const UpdateProfileCommandSchema = z.object({
  travel_style_id: z.string().uuid().optional().nullable(),
  traveler_type_id: z.string().uuid().optional().nullable(),
  interests: z.array(z.string()).optional(),
  past_travel_experiences: z.array(z.string()).optional(),
});

export type UpdateProfileCommand = z.infer<typeof UpdateProfileCommandSchema>;

export const ProfileFormSchema = z.object({
  travel_style_id: z.string({ required_error: "Please select a travel style." }).uuid(),
  traveler_type_id: z.string().uuid().optional().nullable(),
  interests: z.array(z.string()).min(1, "Add at least one interest."),
  past_travel_experiences: z.array(z.string()).optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
