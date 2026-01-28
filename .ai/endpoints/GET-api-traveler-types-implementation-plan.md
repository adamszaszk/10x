# API Endpoint Implementation Plan: GET /api/traveler-types

## 1. Endpoint Overview
Retrieves the list of predefined traveler types (e.g., Solo, Couple, Family) for UI selection.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/traveler-types`
- **Parameters**: None
- **Request Body**: None

## 3. Used Types
- **DTO**: `TravelerTypeDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "is_predefined": true
    }
  ]
  ```

## 5. Data Flow
1. Client requests endpoint.
2. Endpoint queries `traveler_types` table.
3. Returns list.

## 6. Security Considerations
- **Access**: Read-only reference data.

## 7. Error Handling
- `500` on DB error.

## 8. Performance Considerations
- **Caching**: Recommend caching this response as data is static.

## 9. Implementation Steps
1. **Create Endpoint**: `src/pages/api/traveler-types.ts`.
2. **Setup Handler**: Export `GET`.
3. **Implement Logic**:
   - `supabase.from('traveler_types').select('*').order('name')`.
   - Return JSON.
