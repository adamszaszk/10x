import type { Tables, TablesInsert } from "./db/database.types";

/**
 * Represents the user's profile, including travel preferences and usage data.
 * Directly maps to the `profiles` table in the database.
 */
export type ProfileDto = Tables<"profiles">;

/**
 * Command model for updating a user's profile.
 * It allows partial updates to specific fields of the profile.
 * Derived from the `profiles` table entity, making fields optional.
 */
export type UpdateProfileCommand = Partial<
  Pick<Tables<"profiles">, "travel_style_id" | "traveler_type_id" | "interests" | "past_travel_experiences">
>;

/**
 * Represents a travel plan saved by a user.
 * Directly maps to the `plans` table in the database.
 */
export type PlanDto = Tables<"plans">;

/**
 * Represents a paginated list of travel plans.
 * Used in API responses for listing multiple plans.
 */
export interface PaginatedPlansDto {
  data: PlanDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Command model for creating a new travel plan.
 * This is used when a user decides to save a generated plan.
 * The `user_id` will be added on the server from the authenticated session.
 */
export type CreatePlanCommand = Pick<TablesInsert<"plans">, "destination_name" | "plan_data">;

/**
 * Command model for triggering the AI plan generation.
 * Contains the user's free-form text prompt for their travel ideas.
 */
export interface GeneratePlanCommand {
  prompt: string;
}

/**
 * Represents the structure of a newly generated, unsaved travel plan from the AI.
 * This DTO is not directly persisted; it's the transient result of the AI generation process.
 */
export interface GeneratedPlanDto {
  destination_name: string;
  plan_data: {
    introduction: string;
    why_visit: string;
    things_to_do: string;
    sample_itinerary: string;
  };
  disclaimer: string;
}

/**
 * Represents a predefined travel style option.
 * Directly maps to the `travel_styles` table.
 */
export type TravelStyleDto = Tables<"travel_styles">;

/**
 * Represents a predefined traveler type option.
 * Directly maps to the `traveler_types` table.
 */
export type TravelerTypeDto = Tables<"traveler_types">;
