import { describe, it, expect } from "vitest";
import { GeneratePlanCommandSchema, GeneratedPlanDtoSchema } from "./ai.schema";

describe("AI Schemas", () => {
  describe("GeneratePlanCommandSchema", () => {
    it("should validate a valid prompt", () => {
      const input = { prompt: "A trip to Japan" };
      const result = GeneratePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should fail for empty prompt", () => {
      const input = { prompt: "" };
      const result = GeneratePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Prompt is required");
      }
    });

    it("should fail if prompt is missing", () => {
      const input = {};
      const result = GeneratePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should fail for non-string prompt", () => {
      const input = { prompt: 123 };
      const result = GeneratePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("GeneratedPlanDtoSchema", () => {
    const validPlan = {
      destination_name: "Kyoto",
      plan_data: {
        introduction: "Beautiful city",
        why_visit: "Culture",
        things_to_do: "Temples",
        sample_itinerary: "Day 1: ...",
      },
      disclaimer: "AI generated content",
    };

    it("should validate a complete plan object", () => {
      const result = GeneratedPlanDtoSchema.safeParse(validPlan);
      expect(result.success).toBe(true);
    });

    it("should fail if destination_name is missing", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { destination_name: _, ...invalidPlan } = validPlan;
      const result = GeneratedPlanDtoSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });

    it("should fail if plan_data is missing required fields", () => {
      const invalidPlan = {
        ...validPlan,
        plan_data: {
          introduction: "Only intro",
          // missing other fields
        },
      };
      const result = GeneratedPlanDtoSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });

    it("should fail if plan_data structure is incorrect", () => {
      const invalidPlan = {
        ...validPlan,
        plan_data: "Not an object",
      };
      const result = GeneratedPlanDtoSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });
  });
});
