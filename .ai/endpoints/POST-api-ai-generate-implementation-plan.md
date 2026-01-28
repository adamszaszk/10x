# API Endpoint Implementation Plan: POST /api/ai/generate-plan

## 1. Endpoint Overview
This endpoint generates a new, unsaved travel plan using an external AI service. It takes a user's text prompt, combines it with their profile data (such as past travel experiences and preferences), and returns a structured travel plan. The endpoint enforces a monthly generation quota per user.

## 2. Request Details
- **HTTP Method**: `POST`
- **URL Structure**: `/api/ai/generate-plan`
- **Request Body**:
  ```json
  {
    "prompt": "string"
  }
  ```
- **Validation**: The request body will be validated using a Zod schema to ensure `prompt` is a non-empty string.

## 3. Used Types
- **Command Model**: `GeneratePlanCommand` from `src/types.ts` will be used for the request payload.
- **DTO**: `GeneratedPlanDto` from `src/types.ts` will define the structure of the successful response payload.
- **Entity**: `ProfileDto` from `src/types.ts` will be used to access user profile data like `generation_count` and `past_travel_experiences`.

## 4. Response Details
- **Success Response (`200 OK`)**:
  ```json
  {
    "destination_name": "string",
    "plan_data": {
      "introduction": "string",
      "why_visit": "string",
      "things_to_do": "string",
      "sample_itinerary": "string"
    },
    "disclaimer": "string"
  }
  ```
- **Error Responses**: See the Error Handling section for details on status codes `400`, `401`, `429`, and `503`.

## 5. Data Flow
1. The client sends a `POST` request with a JSON payload containing the `prompt` to `/api/ai/generate-plan`.
2. The Astro middleware (`src/middleware/index.ts`) intercepts the request, validates the user's JWT, and attaches a user-scoped Supabase client to `context.locals.supabase`.
3. The API endpoint handler in `src/pages/api/ai/generate-plan.ts` is invoked.
4. The handler validates the incoming request body using a Zod schema (`GeneratePlanCommandSchema`).
5. The handler calls the `aiService.generatePlan()` method, passing the user's prompt and `user_id`.
6. Inside `aiService.generatePlan()`:
    a. The user's profile is fetched from the `profiles` table to check `generation_count` and retrieve `past_travel_experiences`, `travel_style`, and `traveler_type`.
    b. The `generation_count` is checked against the monthly limit (e.g., 20). If exceeded, a `QuotaExceededError` is thrown.
    c. A detailed prompt is constructed for the AI, including the user's prompt, preferences, and a list of past destinations to avoid.
    d. A request is made to the external AI service (Openrouter.ai) via a dedicated `openRouterService`.
    e. The AI's response is parsed and validated against the `GeneratedPlanDto` structure.
    f. If the generation is successful, the `generation_count` for the user is atomically incremented in the database.
7. The `aiService` returns the `GeneratedPlanDto` to the endpoint handler.
8. The handler sends the `GeneratedPlanDto` back to the client with a `200 OK` status.

## 6. Security Considerations
- **Authentication**: All requests must include a valid JWT. The middleware will reject any unauthenticated requests with a `401 Unauthorized` error.
- **Authorization**: The middleware provides a user-scoped Supabase client, ensuring that any database queries for profile data are automatically restricted to the authenticated user via RLS policies.
- **Input Validation**: The `prompt` field will be strictly validated to be a non-empty string to prevent malformed requests.
- **Prompt Injection**: The system prompt sent to the AI will be carefully engineered to separate user input from instructions, minimizing the risk of prompt injection attacks that could alter the AI's intended behavior.
- **Resource Limiting**: The monthly generation quota (`generation_count`) prevents abuse of the expensive AI service and protects against denial-of-service attacks.

## 7. Error Handling
| Status Code | Error Type              | Condition                                                              |
|-------------|-------------------------|------------------------------------------------------------------------|
| `400`       | Bad Request             | The request body is missing the `prompt` or it is not a non-empty string. |
| `401`       | Unauthorized            | The user is not authenticated (no valid JWT provided).                 |
| `429`       | Too Many Requests       | The user has exceeded their monthly plan generation quota.             |
| `503`       | Service Unavailable     | The external AI service (Openrouter.ai) fails to generate a plan or returns an invalid response. |

## 8. Performance Considerations
- **External API Latency**: The primary performance bottleneck will be the response time of the external AI service. The client-side UI should handle this with an appropriate loading state.
- **Database Queries**: The endpoint performs two main database operations: one read (`SELECT` profile) and one write (`UPDATE` profile). These should be fast, but the `UPDATE` must be handled carefully to be atomic. Using Supabase RPC functions for the check-and-increment logic can optimize this.

## 9. Implementation Steps
1. **Create Zod Schema**: In a new file `src/lib/schemas/ai.schema.ts`, define `GeneratePlanCommandSchema` for validating the request body.
2. **Create AI Service**: Create a new file `src/lib/services/ai.service.ts`.
   - Implement a `generatePlan(command: GeneratePlanCommand, userId: string): Promise<GeneratedPlanDto>` method.
   - This service will contain the core business logic: fetching the user profile, checking the quota, calling the AI, and incrementing the count.
3. **Create OpenRouter Service**: Create a new file `src/lib/services/openrouter.service.ts` to encapsulate all communication with the Openrouter.ai API. This service will be called by `ai.service.ts`.
4. **Implement API Endpoint**: Create the file `src/pages/api/ai/generate-plan.ts`.
   - Set `export const prerender = false;`.
   - Implement the `POST` handler function.
   - Use `context.locals.supabase` to get the user session and ID.
   - Validate the request body using the Zod schema.
   - Wrap the call to `aiService.generatePlan()` in a `try...catch` block to handle potential errors and return appropriate HTTP status codes.
5. **Update Profile Logic**: In `ai.service.ts`, ensure the logic for fetching the profile and incrementing `generation_count` is robust. Consider creating a Supabase RPC function (`increment_generation_count`) to handle the check and update atomically.
6. **Environment Variables**: Add `OPENROUTER_API_KEY` to the environment variables (`.env` file) and ensure it's accessible in the services.
7. **Error Handling**: Implement custom error classes (e.g., `QuotaExceededError`, `AIServiceError`) to allow for clean error handling between the service layer and the API endpoint.
8. **Unit & Integration Tests**:
   - Write unit tests for the `ai.service.ts`, mocking the database and OpenRouter service calls.
   - Write integration tests for the `/api/ai/generate-plan` endpoint to verify the full data flow, including authentication and error responses.
