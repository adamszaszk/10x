# REST API Plan for VibeTravels

This document outlines the REST API for the VibeTravels application, designed to be implemented using Astro Server Endpoints and Supabase.

## 1. Resources

The API is designed around the following main resources:

-   **Profiles**: Represents the user's profile, including travel preferences and usage data. Corresponds to the `profiles` table.
-   **Plans**: Represents the AI-generated travel plans saved by the user. Corresponds to the `plans` table.
-   **Travel Styles**: Predefined options for user travel styles. Corresponds to the `travel_styles` table.
-   **Traveler Types**: Predefined options for user traveler types. Corresponds to the `traveler_types` table.
-   **AI**: A functional resource for handling the AI plan generation logic, which is a core business process.

## 2. Endpoints

### 2.1. Profiles

#### GET /api/profile
-   **Description**: Retrieves the profile and preferences for the currently authenticated user.
-   **Query Parameters**: None.
-   **Request Payload**: None.
-   **Response Payload**:
    ```json
    {
      "user_id": "uuid",
      "travel_style_id": "uuid",
      "traveler_type_id": "uuid",
      "interests": ["string"],
      "past_travel_experiences": ["string"],
      "generation_count": "integer"
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**:
    -   `401 Unauthorized`: User is not authenticated.
    -   `404 Not Found`: Profile for the user does not exist.

#### PATCH /api/profile
-   **Description**: Updates the profile for the currently authenticated user.
-   **Query Parameters**: None.
-   **Request Payload**:
    ```json
    {
      "travel_style_id": "uuid", // optional
      "traveler_type_id": "uuid", // optional
      "interests": ["string"], // optional
      "past_travel_experiences": ["string"] // optional
    }
    ```
-   **Response Payload**: The updated profile object (same as GET response).
-   **Success Code**: `200 OK`
-   **Error Codes**:
    -   `400 Bad Request`: Invalid request body or validation failure.
    -   `401 Unauthorized`: User is not authenticated.
    -   `404 Not Found`: Profile for the user does not exist.

### 2.2. Plans

#### GET /api/plans
-   **Description**: Retrieves a list of all travel plans saved by the authenticated user.
-   **Query Parameters**:
    -   `page` (integer, optional, default: 1): For pagination.
    -   `limit` (integer, optional, default: 10): Number of items per page.
    -   `sortBy` (string, optional, default: "created_at"): Field to sort by (e.g., "destination_name").
    -   `order` (string, optional, default: "desc"): Sort order ("asc" or "desc").
-   **Request Payload**: None.
-   **Response Payload**:
    ```json
    {
      "data": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "destination_name": "string",
          "plan_data": {},
          "created_at": "timestamptz"
        }
      ],
      "pagination": {
        "totalItems": "integer",
        "totalPages": "integer",
        "currentPage": "integer"
      }
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: `401 Unauthorized`

#### GET /api/plans/{id}
-   **Description**: Retrieves a single saved travel plan by its ID.
-   **Query Parameters**: None.
-   **Request Payload**: None.
-   **Response Payload**: A single plan object (same as in the GET /api/plans list).
-   **Success Code**: `200 OK`
-   **Error Codes**:
    -   `401 Unauthorized`: User is not authenticated.
    -   `403 Forbidden`: User does not own this plan.
    -   `404 Not Found`: Plan with the specified ID not found.

#### POST /api/plans
-   **Description**: Saves a new travel plan. This is called after a user decides to "Save" a generated plan.
-   **Request Payload**:
    ```json
    {
      "destination_name": "string",
      "plan_data": {} // The full JSONB from the AI generation
    }
    ```
-   **Response Payload**: The newly created plan object.
-   **Success Code**: `201 Created`
-   **Error Codes**:
    -   `400 Bad Request`: Invalid request body or validation failure.
    -   `401 Unauthorized`: User is not authenticated.

#### DELETE /api/plans/{id}
-   **Description**: Deletes a saved travel plan.
-   **Query Parameters**: None.
-   **Request Payload**: None.
-   **Response Payload**: None.
-   **Success Code**: `204 No Content`
-   **Error Codes**:
    -   `401 Unauthorized`: User is not authenticated.
    -   `403 Forbidden`: User does not own this plan.
    -   `404 Not Found`: Plan with the specified ID not found.

### 2.3. AI Plan Generation

#### POST /api/ai/generate-plan
-   **Description**: Triggers the AI to generate a new travel plan based on user input and profile preferences. This is a complex operation that involves multiple steps on the backend.
-   **Request Payload**:
    ```json
    {
      "prompt": "string" // User's free-form text about travel ideas
    }
    ```
-   **Response Payload**: The newly generated, unsaved plan.
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
-   **Success Code**: `200 OK`
-   **Error Codes**:
    -   `400 Bad Request`: Invalid prompt.
    -   `401 Unauthorized`: User is not authenticated.
    -   `429 Too Many Requests`: User has exceeded their monthly generation quota.
    -   `503 Service Unavailable`: The external AI service failed to generate a plan.

### 2.4. Reference Data

#### GET /api/travel-styles
-   **Description**: Retrieves the list of predefined travel styles.
-   **Query Parameters**: None.
-   **Request Payload**: None.
-   **Response Payload**:
    ```json
    [
      {
        "id": "uuid",
        "name": "string"
      }
    ]
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: None expected for this public, static data.

#### GET /api/traveler-types
-   **Description**: Retrieves the list of predefined traveler types.
-   **Query Parameters**: None.
-   **Request Payload**: None.
-   **Response Payload**:
    ```json
    [
      {
        "id": "uuid",
        "name": "string"
      }
    ]
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: None expected for this public, static data.

## 3. Authentication and Authorization

-   **Authentication**: Authentication will be handled using Supabase Auth. Users will log in on the client-side, and the Supabase client will manage JWTs. API requests from the client to the Astro server endpoints will include the JWT in the `Authorization` header (`Bearer <token>`).
-   **Authorization**: The Astro middleware (`src/middleware/index.ts`) will intercept all API requests. It will validate the JWT and use it to create a per-request Supabase client instance with the user's permissions. This instance will be stored in `context.locals.supabase`. All subsequent database operations within the API endpoint will use this client, which automatically enforces the Row-Level Security (RLS) policies defined in the database. This ensures users can only access or modify their own `profiles` and `plans`.

## 4. Validation and Business Logic

### 4.1. Validation
Input validation will be performed at the API endpoint level using `zod` before any database operations occur.

-   **Profiles (`PATCH /api/profile`)**:
    -   `travel_style_id`, `traveler_type_id`: Must be valid UUIDs corresponding to existing entries.
    -   `interests`, `past_travel_experiences`: Must be arrays of strings.
-   **Plans (`POST /api/plans`)**:
    -   `destination_name`: Must be a non-empty string, max length 255.
    -   `plan_data`: Must be a non-empty JSON object.
-   **AI (`POST /api/ai/generate-plan`)**:
    -   `prompt`: Must be a non-empty string.

### 4.2. Business Logic Implementation

-   **User Profile Creation**: A PostgreSQL trigger (`handle_new_user`) on the `auth.users` table automatically creates a corresponding entry in `public.profiles`. The API does not need a `POST /api/profile` endpoint.
-   **Quota Management**:
    -   The `POST /api/ai/generate-plan` endpoint will first query the user's `generation_count` from their profile.
    -   If `generation_count` is 20 or more, it will return a `429 Too Many Requests` error.
    -   If the generation is successful, the endpoint will increment the `generation_count` for that user. This operation must be atomic.
    -   If the external AI service fails, the count is not incremented.
-   **Monthly Quota Reset**: A `pg_cron` job (`reset-monthly-quota`) handles resetting `generation_count` to 0 for all users on the first of each month. This logic resides entirely within the database.
-   **Abstract Destination Handling**: In the `POST /api/ai/generate-plan` endpoint, before calling the AI, the system will fetch the user's `past_travel_experiences` from their profile. This list will be appended to the AI prompt with instructions to suggest a location not on that list.
-   **Save/Discard Flow**: The frontend is responsible for this logic. After a successful response from `POST /api/ai/generate-plan`, the client will display the plan with "Save" and "Discard" options. Clicking "Save" will trigger a call to `POST /api/plans`. Clicking "Discard" will simply discard the data on the client-side, as the plan is not yet persisted in the database.
