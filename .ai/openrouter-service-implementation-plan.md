# OpenRouter Implementation Plan

This document outlines the implementation plan for the `OpenRouterService`, a core component responsible for interacting with the OpenRouter API to generate AI responses using various LLM models. The service is designed to be type-safe, secure, and easily extensible.

## 1. Service Description

The `OpenRouterService` acts as a facade for the OpenRouter API (which mimics the OpenAI API). It abstracts the HTTP communication, authentication, error handling, and response validation.

**Key Responsibilities:**
- Managing API authentication headers (including OpenRouter-specific headers).
- Constructing valid payloads for chat completions.
- Handling structured output generation (JSON mode/schema).
- Parsing and validating AI responses against Zod schemas.
- transforming upstream API errors into domain-specific errors.

## 2. Constructor Description

The service should be instantiated with configuration values, typically loaded from environment variables.

```typescript
constructor(private config: OpenRouterConfig)
```

**`OpenRouterConfig` Interface:**
- `apiKey`: string (Required) - From environment variable `OPENROUTER_API_KEY`.
- `siteUrl`: string (Optional) - For `HTTP-Referer` header (OpenRouter requirement for rankings).
- `appName`: string (Optional) - For `X-Title` header (OpenRouter requirement).
- `defaultModel`: string (Optional) - Fallback model if none specified.

## 3. Public Methods and Fields

### `complete<T>`

The primary method for generating content. It is generic to support typed responses.

**Signature:**
```typescript
async complete<T>(options: CompletionOptions<T>): Promise<T>
```

**`CompletionOptions<T>` Interface:**
- `messages`: `Message[]` - Array of chat messages (system, user, assistant).
- `schema`: `ZodSchema<T>` - Zod schema to validate and structure the response.
- `model`: `string` (Optional) - Specific model identifier (e.g., "google/gemini-2.0-flash-exp:free").
- `temperature`: `number` (Optional) - default 0.7.
- `maxTokens`: `number` (Optional).

**Return Value:**
- Returns a Promise resolving to the data structure matching type `T`.

## 4. Private Methods and Fields

- **`baseUrl`**: `const BASE_URL = "https://openrouter.ai/api/v1"`
- **`getHeaders()`**: Helper to construct headers with API Key, Referer, and Title.
- **`prepareResponseFormat(schema: ZodSchema)`**: Helper to convert the Zod schema into the OpenAI/OpenRouter `json_schema` format if structured output is requested.
- **`handleApiError(response: Response)`**: Helper to parse non-200 responses and throw typed errors.

## 5. Error Handling

The service must handle specific failure scenarios and throw descriptive errors:

1.  **Authentication Error (401):** API key missing or invalid.
2.  **Rate Limit (429):** OpenRouter limits or insufficient credits.
3.  **Model Unavailable (503):** Upstream provider issues.
4.  **Validation Error:** The model returned JSON that doesn't match the Zod schema.
5.  **Parsing Error:** The model returned invalid JSON.

## 6. Security Considerations

- **Server-Side Only:** This service **must** only be used in server-side contexts (API routes, Server Actions, `.astro` frontmatter) to prevent exposing the API key to the client.
- **Environment Variables:** API keys must be loaded from `import.meta.env` and checked for existence at runtime or build time.
- **Input Sanitization:** While LLMs are robust, ensure user inputs passed to prompts don't contain malicious prompt injection that could hijack the system message instructions.

## 7. Step-by-Step Implementation Plan

### Step 1: Install Dependencies

Ensure required packages are available.
`npm install zod zod-to-json-schema`

### Step 2: Define Types

Create `src/types.ts` or `src/lib/services/openrouter.types.ts` (or keep within the service file) to define:
- `Message` (role: 'system' | 'user' | 'assistant', content: string)
- `CompletionOptions`

### Step 3: Implement the Service Class

Create `src/lib/services/openrouter.service.ts`.

#### 3.1 Class Structure

```typescript
import { z } from 'astro/zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface OpenRouterConfig {
  apiKey: string;
  siteUrl: string;
  appName: string;
}

export class OpenRouterService {
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(private config: OpenRouterConfig) {}
  
  // Implementation...
}
```

#### 3.2 Request Construction and `response_format`

Implement the logic to convert Zod schema to JSON schema for the API payload.

**Example `response_format` payload:**
```typescript
const jsonSchema = zodToJsonSchema(schema, { target: "openAi" });

const body = {
  model: options.model,
  messages: options.messages,
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "response_schema", // Optional name
      strict: true, // Important for reliable schema adherence
      schema: jsonSchema
    }
  }
};
```

#### 3.3 Fetch Implementation

Implement the `complete` method using `fetch`.

```typescript
async complete<T>(options: CompletionOptions<T>): Promise<T> {
  const headers = {
    "Authorization": `Bearer ${this.config.apiKey}`,
    "HTTP-Referer": this.config.siteUrl,
    "X-Title": this.config.appName,
    "Content-Type": "application/json"
  };
  
  // ... construct body ...

  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    await this.handleError(response);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // ... parse and validate content ...
}
```

#### 3.4 Response Parsing

Parse the string content from `data.choices[0].message.content` into JSON, then validate with Zod.

```typescript
try {
  const json = JSON.parse(content);
  return options.schema.parse(json);
} catch (e) {
  // Handle JSON parse error or Zod validation error
  throw new Error("Failed to parse AI response: " + e.message);
}
```

### Step 4: Environment Variable Configuration

Update `env.d.ts` to include `OPENROUTER_API_KEY`, `PUBLIC_SITE_URL`, `PUBLIC_APP_NAME` (if public) or server-side equivalents.

### Step 5: Integration

Instantiate the service in a singleton pattern or within the API route handler.

```typescript
// src/lib/services/ai.service.ts or similar
export const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  siteUrl: import.meta.env.SITE_URL || "http://localhost:4321",
  appName: "VibeTravels"
});
```

### Step 6: Testing

Create a test API route or unit test to verify:
1.  Simple text completion.
2.  Structured JSON completion (e.g., generating a simple plan object).
3.  Error handling (invalid key).
