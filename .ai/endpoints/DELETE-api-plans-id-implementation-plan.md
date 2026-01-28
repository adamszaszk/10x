# API Endpoint Implementation Plan: DELETE /api/plans/[id]

## 1. Endpoint Overview
This endpoint allows a user to delete one of their saved travel plans permanently.

## 2. Request Details
- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/plans/[id]`
- **Parameters**:
  - `id`: UUID (path parameter)
- **Request Body**: None

## 3. Used Types
- None specific (returns status only).

## 4. Response Details
- **Success Response (`204 No Content`)**: Empty body.
- **Error Responses**:
  - `400 Bad Request`: Invalid ID.
  - `401 Unauthorized`.
  - `404 Not Found`.

## 5. Data Flow
1. Client sends `DELETE` to `/api/plans/{id}`.
2. Middleware checks auth.
3. Handler validates ID.
4. Handler performs delete operation on `plans` table.
5. If no rows affected, implies 404/403.
6. Return 204.

## 6. Security Considerations
- **RLS**: Ensures users can only delete their own plans.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `404` | Not Found | Record didn't exist or wasn't deleted (e.g. RLS blocked). |
| `500` | Internal Error | DB error. |

## 8. Performance Considerations
- **DB**: Simple PK delete. Fast.

## 9. Implementation Steps
1. **Update Endpoint**: Open `src/pages/api/plans/[id].ts`.
2. **Add Handler**: Export `DELETE` function.
3. **Implement Logic**:
   - `const { error, count } = await supabase.from('plans').delete().eq('id', id)`.
   - Check `error` or if `count === 0` (note: `select()` might be needed to check existence if we want explicit 404, or relies on count return if headers allow `Prefer: count=exact`).
   - If success, return `new Response(null, { status: 204 })`.
