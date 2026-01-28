import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AIService, QuotaExceededError, buildUserPrompt } from "./ai.service";
import { openRouterService } from "./openrouter.service";
import type { GeneratePlanCommand } from "../../types";

// Mock dependencies
vi.mock("./openrouter.service", () => ({
  openRouterService: {
    complete: vi.fn(),
  },
}));

describe("AIService", () => {
  let aiService: AIService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBuilder: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any; // Using any for mock convenience

  beforeEach(() => {
    aiService = new AIService();

    mockBuilder = {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { generation_count: 5, interests: ["Art"] },
        error: null,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      then: (resolve: any) => resolve({ error: null }),
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }),
      },
    };
    vi.clearAllMocks();
  });

  describe("generatePlan", () => {
    const mockCommand: GeneratePlanCommand = {
      prompt: "Trip to Paris",
    };
    const mockUserId = "user-123";

    it("should orchestrate the plan generation correctly", async () => {
      // Arrange
      const mockGeneratedPlan = {
        destination_name: "Paris",
        plan_data: {
          introduction: "Intro",
          why_visit: "Why",
          things_to_do: "Things",
          sample_itinerary: "Itinerary",
        },
        disclaimer: "Disclaimer",
      };

      vi.mocked(openRouterService.complete).mockResolvedValue(mockGeneratedPlan);

      // Act
      const result = await aiService.generatePlan(mockSupabase as SupabaseClient, mockCommand, mockUserId);

      // Assert
      expect(openRouterService.complete).toHaveBeenCalledTimes(1);

      const callArgs = vi.mocked(openRouterService.complete).mock.calls[0][0];

      // Verify prompt construction
      expect(callArgs.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user", content: expect.stringContaining("Trip to Paris") }),
        ])
      );
      // Verify profile data was used
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userMessage = callArgs.messages.find((m: any) => m.role === "user");
      expect(userMessage?.content).toContain("Interests: Art");

      expect(result).toEqual(mockGeneratedPlan);
    });

    it("should propagate errors from the AI provider", async () => {
      // Arrange
      const error = new Error("AI Service Unreachable");
      vi.mocked(openRouterService.complete).mockRejectedValue(error);

      // Act & Assert
      await expect(aiService.generatePlan(mockSupabase as SupabaseClient, mockCommand, mockUserId)).rejects.toThrow(
        "AI Service Unreachable"
      );
    });

    it("should throw QuotaExceededError when limit reached", async () => {
      // Arrange
      mockBuilder.single.mockResolvedValue({
        data: { generation_count: 20 },
        error: null,
      });

      // Act & Assert
      await expect(aiService.generatePlan(mockSupabase as SupabaseClient, mockCommand, mockUserId)).rejects.toThrow(
        QuotaExceededError
      );
    });
  });

  describe("Prompt Construction", () => {
    it("should format the prompt correctly with profile data", () => {
      const prompt = buildUserPrompt("Tokyo Adventure", {
        interests: ["Food", "History"],
        past_travel_experiences: ["Crowds"],
      });

      expect(prompt).toContain('User Request: "Tokyo Adventure"');
      expect(prompt).toContain("Interests: Food, History");
      expect(prompt).toContain("Past Experiences (avoid these): Crowds");
    });

    it("should format the prompt correctly with empty profile", () => {
      const prompt = buildUserPrompt("Tokyo Adventure", {});
      expect(prompt).toBe('User Request: "Tokyo Adventure"');
    });
  });
});
