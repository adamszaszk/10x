import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "./openrouter.service";
import { z } from "zod";

// Mock schema for testing
const TestSchema = z.object({
  answer: z.string(),
});

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const mockConfig = {
    apiKey: "test-key",
    siteUrl: "http://test.com",
    appName: "Test App",
    defaultModel: "test-model",
  };

  // Mock global fetch
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    service = new OpenRouterService(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call the API with correct payload and headers", async () => {
    // Arrange
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ answer: "42" }) } }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    // Act
    await service.complete({
      messages: [{ role: "user", content: "What is the answer?" }],
      schema: TestSchema,
    });

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, requestInit] = mockFetch.mock.calls[0];

    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");

    expect(requestInit.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer test-key",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://test.com",
        "X-Title": "Test App",
      })
    );

    const body = JSON.parse(requestInit.body);
    expect(body).toEqual(
      expect.objectContaining({
        model: "test-model",
        messages: expect.arrayContaining([expect.objectContaining({ role: "user", content: "What is the answer?" })]),
        response_format: expect.objectContaining({
          type: "json_object",
        }),
      })
    );
  });

  it("should parse and validate the JSON response correctly", async () => {
    // Arrange
    const content = { answer: "The answer is 42" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(content) } }] }),
    });

    // Act
    const result = await service.complete({
      messages: [{ role: "user", content: "test" }],
      schema: TestSchema,
    });

    // Assert
    expect(result).toEqual(content);
  });

  it("should throw API_ERROR when content is missing", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }), // No choices
    });

    // Act & Assert
    await expect(
      service.complete({
        messages: [{ role: "user", content: "test" }],
        schema: TestSchema,
      })
    ).rejects.toThrow("Invalid response from AI provider");
  });

  it("should throw AUTH_ERROR on 401", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid API Key",
    });

    // Act & Assert
    await expect(
      service.complete({
        messages: [{ role: "user", content: "test" }],
        schema: TestSchema,
      })
    ).rejects.toThrow("Authentication failed: Unauthorized");
    // Note: The specific error message depends on handleApiError implementation, usually prints status+text
  });

  it("should throw VALIDATION_ERROR when response schema does not match", async () => {
    // Arrange
    const invalidContent = { somethingElse: 123 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(invalidContent) } }] }),
    });

    // Act & Assert
    // The service wraps unknown errors or validation errors.
    // It calls `parseAndValidateResponse` internally.
    await expect(
      service.complete({
        messages: [{ role: "user", content: "test" }],
        schema: TestSchema,
      })
    ).rejects.toThrow(); // Expect it to fail
  });

  it("should handle malformed JSON in response", async () => {
    // Arrange
    const malformedContent = "{ answer: 'oops missing quotes' "; // Invalid JSON
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: malformedContent } }] }),
    });

    // Act & Assert
    await expect(
      service.complete({
        messages: [{ role: "user", content: "test" }],
        schema: TestSchema,
      })
    ).rejects.toThrow();
  });
});
