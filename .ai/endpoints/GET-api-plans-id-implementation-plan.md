# API Endpoint Implementation Plan: GET /api/plans/[id]

## 1. Endpoint Overview
This endpoint retrieves a single travel plan by its unique ID. It ensures that the plan exists and belongs to the requesting user before returning it.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans/[id]` (Dynamic route)
- **Parameters**:
  - `id`: UUID (path parameter)
- **Request Body**: None

## 3. Used Types
- **DTO**: `PlanDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: The `PlanDto` object.
- **Error Responses**:
  - `400 Bad Request`: Invalid UUID format.
  - `401 Unauthorized`.
  - `404 Not Found`: Plan does not exist.

## 5. Data Flow
1. Client calls `/api/plans/{id}`.
2. Astro routes to `src/pages/api/plans/[id].ts`.
3. Middleware validates auth.
4. Handler reads `id` from `context.params`.
5. Handler queries `plans` table for `id`.
   - Note: RLS will automatically filtering out plans not owned by the user.
6. If the query returns no rows, return 404 (or 403 conceptually, but usually 404 to avoid leaking existence).
7. Return the plan data.

## 6. Security Considerations
- **IDOR Protection**: Row-Level Security (RLS) is the primary defense. Even if a user guesses another ID, the DB query will return nothing.
- **UUID Validation**: Ensure the `id` param is a valid UUID to prevent database errors.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `400` | Bad Request | ID is not a valid UUID. |
| `404` | Not Found | Plan not found or not owned by user. |

## 8. Performance Considerations
- **Primary Key Lookup**: This is an O(1) operation using the standard PK index.

## 9. Implementation Steps
1. **Create Endpoint**: `src/pages/api/plans/[id].ts`.
2. **Setup Handler**: Export `GET` function.
3. **Implement Logic**:
   - Get `id` from params.
   - Validate `id` is UUID.
   - `await supabase.from('plans').select('*').eq('id', id).single()`.
   - Handle error code `PGRST116` as 404.
   - Return 200 with plan.
