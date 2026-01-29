import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratePlanCommand, GeneratedPlanDto } from "../../types";
import { GeneratedPlanDtoSchema } from "../schemas/ai.schema";
import { openRouterService } from "./openrouter.service";
import { mockAiService } from "./mock-ai.service";

export class QuotaExceededError extends Error {
  constructor(message = "Monthly generation quota exceeded") {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class AIService {
  private readonly MONTHLY_QUOTA = 20;

  async generatePlan(
    supabase: SupabaseClient,
    command: GeneratePlanCommand,
    userId: string
  ): Promise<GeneratedPlanDto> {
    // 1. Fetch User Profile & Check Quota
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to fetch user profile");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentCount = (profile as any).generation_count || 0;

    if (currentCount >= this.MONTHLY_QUOTA) {
      throw new QuotaExceededError();
    }

    // Construct Prompt
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(command.prompt, profile);

    // Call Real AI Service or Mock
    let generatedPlan: GeneratedPlanDto;

    if (import.meta.env.MOCK_AI_RESPONSE === "true") {
      generatedPlan = await mockAiService.complete();
    } else {
      generatedPlan = await openRouterService.complete<GeneratedPlanDto>({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        schema: GeneratedPlanDtoSchema,
        temperature: 0.7,
      });
    }

    // Increment Quota (skip if mocking)
    if (import.meta.env.MOCK_AI_RESPONSE !== "true") {
      const { error: updateError } = await supabase
        .from("profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ generation_count: currentCount + 1 } as any)
        .eq("user_id", userId); // consistently use user_id

      if (updateError) {
        // We don't fail the request if this fails, but we should log it.
      }
    }

    return generatedPlan;
  }
}

export function buildSystemPrompt(): string {
  return `You are an expert travel planner AI for VibeTravels.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildUserPrompt(userInput: string, profile: any): string {
  // past_travel_experiences

  // Improving the prompt context with available data
  const context = [];
  if (profile?.interests?.length) context.push(`Interests: ${profile.interests.join(", ")}`);
  if (profile?.past_travel_experiences?.length)
    context.push(`Past Experiences (avoid these): ${profile.past_travel_experiences.join(", ")}`);

  const contextStr = context.length ? `\n\nUser Profile Context:\n${context.join("\n")}` : "";

  return `User Request: "${userInput}"${contextStr}`;
}

export const aiService = new AIService();
