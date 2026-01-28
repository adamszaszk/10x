# API Endpoint Implementation Plan: GET /api/profile

## 1. Endpoint Overview
This endpoint retrieves the comprehensive profile information for the currently authenticated user. It fetches travel preferences (style, traveler type, interests, past experiences) and account usage data (generation count) to populate the user's profile page.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/profile`
- **Parameters**: None
- **Request Body**: None

## 3. Used Types
- **DTO**: `ProfileDto` from `src/types.ts` (maps to `tables['profiles']`)

## 4. Response Details
- **Success Response (`200 OK`)**:
  ```json
  {
    "user_id": "uuid",
    "travel_style_id": "uuid",
    "traveler_type_id": "uuid",
    "interests": ["string"],
    "past_travel_experiences": ["string"],
    "generation_count": 0
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: Profile does not exist errors.

## 5. Data Flow
1. The client sends a `GET` request to `/api/profile`.
2. The Astro middleware intercepts the request, validates the JWT, and adds `context.locals.supabase`.
3. The endpoint handler uses `context.locals.supabase` to query the `profiles` table.
4. The query filters by the authenticated user's ID (implicitly handled by RLS and explicit query).
5. The handler returns the profile data as JSON.

## 6. Security Considerations
- **Authentication**: Mandatory. Middleware ensures only authenticated users reach the logic.
- **Authorization**: Row-Level Security (RLS) on the `profiles` table restricts access to the user's own row.
- **Data Privacy**: Only the requesting user's data is returned.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `401` | Unauthorized | Missing or invalid authentication token. |
| `404` | Not Found | Profile row not found for the user (rare, but possible if trigger failed). |
| `500` | Internal Server Error | Database connection failure or query error. |

## 8. Performance Considerations
- **Database Index**: The `profiles` table has a primary key on `user_id`, ensuring O(1) lookup.
- **Caching**: Profile data changes infrequently. Caching headers (e.g., `Cache-Control`) could be considered, but given the real-time nature of `generation_count`, we should likely avoid aggressive caching or use `no-cache`.

## 9. Implementation Steps
1. **Create Endpoint File**: Create `src/pages/api/profile.ts`.
2. **Setup Handler**: Export a `GET` function.
3. **Configure Rendering**: Set `export const prerender = false;`.
4. **Implement Logic**:
   - Access `context.locals.supabase`.
   - Perform `await supabase.from('profiles').select('*').single()`.
   - Handle the `data` and `error` from Supabase.
   - If error is 'PGRST116' (row not found), return 404.
   - Return 200 with `data`.
5. **Integration Test**: Verify the endpoint returns the correct profile for a logged-in user.
