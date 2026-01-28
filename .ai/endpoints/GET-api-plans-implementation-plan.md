# API Endpoint Implementation Plan: GET /api/plans

## 1. Endpoint Overview
This endpoint returns a paginated list of travel plans saved by the current user. It supports pagination parameters (`page`, `limit`) and sorting (`sortBy`, `order`) to allow users to browse their history.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans`
- **Parameters**:
  - `page`: Integer (default 1)
  - `limit`: Integer (default 10)
  - `sortBy`: String (default "created_at")
  - `order`: String ("asc" | "desc", default "desc")
- **Request Body**: None

## 3. Used Types
- **DTO**: `PaginatedPlansDto` from `src/types.ts`.
- **Entity**: `PlanDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "destination_name": "string",
        "created_at": "timestamp",
        // ... other PlanDto fields
      }
    ],
    "pagination": {
      "totalItems": 100,
      "totalPages": 10,
      "currentPage": 1
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`

## 5. Data Flow
1. Client sends `GET` request with query params.
2. Middleware ensures auth.
3. Handler extracts and validates query params.
4. Handler performs two queries (or one combined):
   - Count total records for the user.
   - Fetch the slice of records based on page/limit.
5. Handler constructs the `PaginatedPlansDto` and returns it.

## 6. Security Considerations
- **RLS**: Ensures users see only their plans.
- **Pagination limits**: Enforce a maximum `limit` (e.g., 50) to prevent fetching too much data at once.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `401` | Unauthorized | User not authenticated. |
| `500` | Internal Error | Database query failed. |

## 8. Performance Considerations
- **Indexing**: `plans(user_id)` index is critical for performance. `created_at` index might be useful for sorting.
- **Count Performance**: `count(*)` can be slow on large tables; using Supabase's `{ count: 'exact' }` is efficient enough for this scale.

## 9. Implementation Steps
1. **Create Endpoint**: `src/pages/api/plans/index.ts`.
2. **Setup Handler**: Export `GET` function.
3. **Helper Function**: Create a helper to parse query params securely (handling defaults and valid values for sort).
4. **Implement Logic**:
   - Calculate `from` and `to` range for Supabase `range()` method.
   - `await supabase.from('plans').select('*', { count: 'exact' }).order(sortBy, { ascending: order === 'asc' }).range(from, to)`.
   - Map response to `PaginatedPlansDto`.
   - Return 200.
