import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./generate-plan";
import { aiService, QuotaExceededError } from "../../../lib/services/ai.service";

// Mock dependencies
vi.mock("../../../lib/services/ai.service", () => ({
  aiService: {
    generatePlan: vi.fn(),
  },
  QuotaExceededError: class extends Error {},
}));

describe("POST /api/ai/generate-plan", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    mockContext = {
      locals: {
        supabase: mockSupabase,
      },
      request: {
        json: vi.fn(),
      },
    };
  });

  it("should return 401 if user is not authenticated", async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if request body is invalid", async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockContext.request.json.mockResolvedValue({ prompt: "" }); // Empty prompt is invalid

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Invalid request" });
    expect(aiService.generatePlan).not.toHaveBeenCalled();
  });

  it("should return 200 with plan on success", async () => {
    // Arrange
    const mockPlan = { destination_name: "Paris", plan_data: {} };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockContext.request.json.mockResolvedValue({ prompt: "Go to Paris" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(aiService.generatePlan).mockResolvedValue(mockPlan as any);

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockPlan);
    expect(aiService.generatePlan).toHaveBeenCalledWith(mockSupabase, { prompt: "Go to Paris" }, "user-1");
  });

  it("should return 429 if quota exceeded", async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockContext.request.json.mockResolvedValue({ prompt: "Go to Paris" });
    vi.mocked(aiService.generatePlan).mockRejectedValue(new QuotaExceededError("Quota limit reached"));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(429);
  });

  it("should return 500 for generic errors", async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockContext.request.json.mockResolvedValue({ prompt: "Go to Paris" });
    vi.mocked(aiService.generatePlan).mockRejectedValue(new Error("Random failure"));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: "Internal Server Error (UNKNOWN)",
      details: "Random failure",
      code: "UNKNOWN",
    });
  });
});
