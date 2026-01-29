import { z } from "zod"; // Use 'zod' directly as indicated in package.json/plan
import { zodToJsonSchema } from "zod-to-json-schema";

export interface OpenRouterConfig {
  apiKey: string;
  siteUrl?: string;
  appName?: string;
  defaultModel?: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions<T> {
  messages: Message[];
  schema: z.ZodSchema<T>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenRouterError extends Error {
  constructor(
    public message: string,
    public code:
      | "AUTH_ERROR"
      | "RATE_LIMIT"
      | "MODEL_UNAVAILABLE"
      | "API_ERROR"
      | "PARSE_ERROR"
      | "VALIDATION_ERROR"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterService {
  private static readonly BASE_URL = "https://openrouter.ai/api/v1";

  constructor(private config: OpenRouterConfig) {}

  /**
   * Generates a structured AI response based on the provided messages and Zod schema.
   */
  async complete<T>(options: CompletionOptions<T>): Promise<T> {
    // Switch to a more stable model (Gemini 2.0 Flash) to avoid 'experimental' rate limits
    const model = options.model || this.config.defaultModel || "google/gemini-2.0-flash-001";
    const temperature = options.temperature ?? 0.7;
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000;

    // Debug API Key loading
    if (this.config.apiKey) {
      // console.log(`[OpenRouter] Should use API Key: ${this.config.apiKey.substring(0, 10)}...`);
      // console.log(`[OpenRouter] Using Model: ${model}`);
    } else {
      // console.error("[OpenRouter] API Key is MISSING or EMPTY");
    }

    if (!this.config.apiKey) {
      throw new OpenRouterError("OpenRouter API Key is missing. Check environment variables.", "AUTH_ERROR");
    }

    const headers = this.getHeaders();
    const payload = this.constructPayload(options, model, temperature);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastError: any;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // console.log(`[OpenRouter] Attempt ${attempt + 1}: Contacting ${OpenRouterService.BASE_URL}/chat/completions`);
        const response = await fetch(`${OpenRouterService.BASE_URL}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          await this.handleApiError(response);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new OpenRouterError("Invalid response from AI provider: No content received.", "API_ERROR");
        }

        return this.parseAndValidateResponse(content, options.schema);
      } catch (error) {
        // console.error(`[OpenRouter] Details for attempt ${attempt + 1} failure:`, error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any)?.cause) {
          // console.error(`[OpenRouter] Failure cause:`, (error as any).cause);
        }

        lastError = error;

        const isRateLimit = error instanceof OpenRouterError && error.code === "RATE_LIMIT";
        const isServiceUnavailable = error instanceof OpenRouterError && error.code === "MODEL_UNAVAILABLE";
        const isNetworkError =
          error instanceof Error && (error.name === "TypeError" || error.message.includes("fetch failed"));

        if ((isRateLimit || isServiceUnavailable || isNetworkError) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          // console.log(
          //   `AI Service attempt ${attempt + 1} failed with ${error instanceof Error ? error.message : "error"}. Retrying in ${delay}ms...`
          // );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (error instanceof OpenRouterError) {
          throw error;
        }

        throw new OpenRouterError(
          `AI Service Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "UNKNOWN"
        );
      }
    }

    throw lastError || new OpenRouterError("Max retries exceeded", "UNKNOWN");
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.config.siteUrl) {
      headers["HTTP-Referer"] = this.config.siteUrl;
    }

    if (this.config.appName) {
      headers["X-Title"] = this.config.appName;
    }

    return headers;
  }

  private constructPayload<T>(options: CompletionOptions<T>, model: string, temperature: number) {
    // Generate JSON schema to instruct the model
    // Cast to any to avoid deep instantiation error with generic Zod schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonSchema = zodToJsonSchema(options.schema as any);
    const schemaString = JSON.stringify(jsonSchema, null, 2);

    // Inject schema instructions into the system message
    const messages = [...options.messages];
    const systemMessageIndex = messages.findIndex((m) => m.role === "system");

    if (systemMessageIndex !== -1) {
      messages[systemMessageIndex] = {
        ...messages[systemMessageIndex],
        content:
          messages[systemMessageIndex].content +
          `\n\nIMPORTANT: You must respond with valid JSON matching this schema:\n${schemaString}`,
      };
    } else {
      messages.unshift({
        role: "system",
        content: `IMPORTANT: You must respond with valid JSON matching this schema:\n${schemaString}`,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      model,
      messages,
      temperature,
      response_format: {
        type: "json_object",
      },
    };

    if (options.maxTokens) {
      payload.max_tokens = options.maxTokens;
    }

    return payload;
  }

  private parseAndValidateResponse<T>(content: string, schema: z.ZodSchema<T>): T {
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      throw new OpenRouterError("Failed to parse AI response as JSON.", "PARSE_ERROR");
    }

    const result = schema.safeParse(json);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new OpenRouterError(`AI response validation failed: ${errorMsg}`, "VALIDATION_ERROR");
    }

    return result.data;
  }

  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = response.statusText;
    let fullError = {};
    try {
      try {
        fullError = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorBody = fullError as any;
        if (errorBody?.error?.message) {
          errorMessage = errorBody.error.message;
        } else if (errorBody?.message) {
          errorMessage = errorBody.message;
        }

        // Log granular error details for debugging
        if (errorBody?.error?.metadata) {
          // console.log("OpenRouter Error Metadata:", JSON.stringify(errorBody.error.metadata, null, 2));
        }
        if (response.status === 429) {
          // console.log("Rate Limit Hit. Headers:", JSON.stringify([...response.headers.entries()]));
        }
      } catch {
        // Ignore JSON parse error on error response
      }
    } catch {
      // Failed to parse error body, stick with statusText
    }

    switch (response.status) {
      case 401:
        throw new OpenRouterError(`Authentication failed: ${errorMessage}`, "AUTH_ERROR");
      case 429:
        throw new OpenRouterError(`Rate limit exceeded: ${errorMessage}`, "RATE_LIMIT");
      case 503:
        throw new OpenRouterError(`Model unavailable: ${errorMessage}`, "MODEL_UNAVAILABLE");
      default:
        throw new OpenRouterError(`API Error (${response.status}): ${errorMessage}`, "API_ERROR");
    }
  }
}

// Instantiate the service with environment variables
export const openRouterService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY || "",
  siteUrl: import.meta.env.PUBLIC_SITE_URL,
  appName: import.meta.env.PUBLIC_APP_NAME ?? "VibeTravels",
  defaultModel: "google/gemini-2.0-flash-001",
});
