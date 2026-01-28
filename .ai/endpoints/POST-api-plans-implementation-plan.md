# API Endpoint Implementation Plan: POST /api/plans

## 1. Endpoint Overview
This endpoint allows users to save a generated travel plan. It accepts the destination name and the structured plan data (JSON) and persists it to the `plans` table linked to the user.

## 2. Request Details
- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans`
- **Parameters**: None
- **Request Body**:
  ```json
  {
    "destination_name": "string",
    "plan_data": { ... } // JSON object
  }
  ```
- **Validation**:
  - `destination_name`: Non-empty string, max 255 chars.
  - `plan_data`: Valid object/JSON.

## 3. Used Types
- **Command Model**: `CreatePlanCommand` from `src/types.ts`.
- **DTO**: `PlanDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`201 Created`)**: The created `PlanDto`.
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`.

## 5. Data Flow
1. Client sends `POST` with plan details.
2. Middleware validates auth.
3. Handler validates body against `CreatePlanCommandSchema`.
4. Handler inserts a new row into `plans` table with `user_id` from session.
5. Returns the created row.

## 6. Security Considerations
- **Input Validation**: Prevent storing excessive data size in `plan_data` or malicious scripts (though mostly JSON content).
- **Quota/Rate Limiting**: While generation is limited, saving might also need protection against spamming, though less critical than AI costs.

## 7. Error Handling
| Status Code | Error Type | Condition |
|---|---|---|
| `400` | Bad Request | Missing name or plan data. |
| `401` | Unauthorized | No user session. |
| `500` | Internal Error | Insert failed. |

## 8. Performance Considerations
- **JSONB**: Postgres `JSONB` is efficient for storage.
- **Size**: Depending on the detailed nature of AI plans, payloads can be large.

## 9. Implementation Steps
1. **Define Schema**: Create `CreatePlanCommandSchema` in `src/lib/schemas/plan.schema.ts`.
2. **Update Endpoint**: Edit `src/pages/api/plans/index.ts`.
3. **Add Handler**: Export `POST` function.
4. **Implement Logic**:
   - Validate input.
   - `supabase.from('plans').insert({ ...body, user_id: user.id }).select().single()`.
   - Return 201 with data.
