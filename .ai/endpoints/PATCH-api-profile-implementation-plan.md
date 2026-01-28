# API Endpoint Implementation Plan: PATCH /api/profile

## 1. Endpoint Overview
This endpoint allows the authenticated user to update their profile preferences, such as travel style, traveler type, interests, and past travel experiences. It supports partial updates.

## 2. Request Details
- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/profile`
- **Parameters**: None
- **Request Body**:
  ```json
  {
    "travel_style_id": "uuid", // Optional
    "traveler_type_id": "uuid", // Optional
    "interests": ["string"], // Optional
    "past_travel_experiences": ["string"] // Optional
  }
  ```
- **Validation**: Zod schema to ensure UUID formats and array types.

## 3. Used Types
- **Command Model**: `UpdateProfileCommand` from `src/types.ts`.
- **DTO**: `ProfileDto` from `src/types.ts` (for the response).

## 4. Response Details
- **Success Response (`200 OK`)**: The updated profile object.
- **Error Responses**:
  - `400 Bad Request`: Validation failed.
  - `401 Unauthorized`: Not authenticated.
  - `500 Internal Server Error`: Database error.

## 5. Data Flow
1. Client sends a `PATCH` request with the JSON body.
2. Middleware validates auth and provides Supabase client.
3. Handler validates the request body using `UpdateProfileCommandSchema`.
4. Handler executes an `update` query on the `profiles` table for the authenticated user.
5. Handler returns the updated record.

## 6. Security Considerations
- **Input Validation**: Strict validation of UUIDs and array contents to prevent injection or malformed data.
- **Authorization**: RLS ensures users can only update their own profile.
- **Sanitization**: Inputs are sanitized by Zod and parameterized queries.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `400` | Bad Request | Request body fails validation (e.g., invalid UUID). |
| `401` | Unauthorized | User not authenticated. |
| `500` | Internal Error | Database update failed. |

## 8. Performance Considerations
- **Atomic Updates**: The `PATCH` operation maps directly to a single SQL UPDATE.
- **Payload Size**: The payload is small, so network overhead is minimal.

## 9. Implementation Steps
1. **Define Schema**: Create `UpdateProfileCommandSchema` in `src/lib/schemas/profile.schema.ts` using Zod to match `UpdateProfileCommand`.
2. **Update Endpoint File**: Open `src/pages/api/profile.ts`.
3. **Add Handler**: Export a `PATCH` function.
4. **Implement Logic**:
   - Parse body using `request.json()`.
   - Validate body against schema.
   - Call `supabase.from('profiles').update(validatedData).eq('user_id', user.id).select().single()`.
   - Return 200 with result or appropriate error.
