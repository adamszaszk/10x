# View Implementation Plan: My Plans Page

## 1. Overview
The "My Plans" page serves as a personal archive for authenticated users, displaying a list of their saved travel itineraries. It allows users to browse their history, view summaries of trips, and navigate to full plan details. Additionally, it provides a clear entry point for users to generate new travel plans by navigating to the Dashboard. This view corresponds to the "My Plans" page described in the requirements and fulfills User Story US-007, while supporting US-004 by facilitating access to the generation flow.

## 2. View Routing
- **Path**: `/plans`
- **Protection**: Protected route (requires authentication). Redirects to `/login` if unauthorized.

## 3. Component Structure
- `src/pages/plans/index.astro` (Page Controller)
    - `Layout` (Astro Layout)
        - `PlanListContainer` (React Container - `client:load`)
            - `PageHeader` (React Presentational)
                - `CreatePlanButton` (React Presentational / Link)
            - `PlanList` (React Presentational)
                - `PlanSummaryCard` (React Presentational)
            - `PaginationControl` (React Presentational / Shadcn UI)
            - `EmptyState` (React Presentational)

## 4. Component Details

### `src/pages/plans/index.astro`
- **Description**: The server-side entry point. It handles session verification and renders the main layout.
- **Main Elements**: 
    - `Layout`: Wraps the page content.
    - `PlanListContainer`: The interactive React component responsible for fetching and displaying plans.
- **Handled Validation**: 
    - Checks `context.locals.supabase.auth.getUser()`. If no user, redirects to `/login` (or handled via middleware).

### `src/components/plans/PlanListContainer.tsx`
- **Description**: A smart container component that manages the state of the plans list, including fetching data, handling pagination, and loading states.
- **Main Elements**: 
    - `div` wrapper for layout.
    - `PageHeader`: Contains the "My Plans" title and the "Create New Plan" button.
    - Conditional rendering: `Skeleton` (loading), `EmptyState` (no data), or `PlanList` (data present).
- **Handled Interactions**:
    - `useEffect`: Triggers data fetching on mount and when `page` changes.
    - `handlePageChange`: Updates the current page state.
- **Types**: 
    - State: `plans: PlanDto[]`, `pagination: PaginationMeta`, `isLoading: boolean`, `error: string | null`.

### `src/components/plans/PageHeader.tsx`
- **Description**: Renders the top section of the page with the title and primary action.
- **Main Elements**:
    - `h1`: "My Plans".
    - `Button` (Shadcn UI): "Create New Plan" (as an `a` tag or `Link`) pointing to `/dashboard`.
- **Props**: None.

### `src/components/plans/PlanList.tsx`
- **Description**: A pure presentational component that renders the grid of plan cards.
- **Main Elements**: 
    - `div` with grid layout (Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
    - Maps through `plans` array to render `PlanSummaryCard`.
- **Props**: 
    - `plans: PlanDto[]`

### `src/components/plans/PlanSummaryCard.tsx`
- **Description**: Displays a summary of a single travel plan. Matches `PlanSummaryCard` from UI Plan.
- **Main Elements**: 
    - `Card` (Shadcn UI): Container.
    - `CardHeader`: Displays `destination_name`.
    - `CardDescription`: Displays formatted `created_at` date.
    - `CardContent`: Displays a truncated snippet of the `introduction` from `plan_data`.
    - `Button`: "View Plan" link to `/plans/[id]`.
- **Props**: 
    - `plan: PlanDto`

### `src/components/plans/EmptyState.tsx`
- **Description**: Displayed when the user has no saved plans.
- **Main Elements**: 
    - Icon (e.g., `Map` or `FileText` from `lucide-react`).
    - Text: "You haven't saved any plans yet."
    - `Button`: "Create New Plan" linking to `/dashboard` (The central hub for plan generation).

## 5. Types

### `src/types.ts` (Existing & Extended)
Ensure the following types are available and correctly defined:

```typescript
// Existing
export type PlanDto = Tables<'plans'>;

// Existing
export type PaginatedPlansDto = {
    data: PlanDto[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
};

// New Helper for type safety within components
export type PlanDataContent = {
    introduction: string;
    why_visit: string;
    things_to_do: string;
    sample_itinerary: string;
};
```

## 6. State Management
State will be managed locally within `PlanListContainer` using React hooks, as this is a specific view requirement and doesn't strictly require global state.

- **`plans`**: `PlanDto[]` - Stores the list of plans for the current page.
- **`pagination`**: Object containing `currentPage`, `totalPages`, `totalItems`.
- **`isLoading`**: `boolean` - Tracks API fetch status.
- **`error`**: `string | null` - Stores error messages.

## 7. API Integration

### Endpoint: `GET /api/plans`
*Note: This endpoint needs to be implemented to support this view.*

- **Request**:
    - Method: `GET`
    - Query Params: `page` (number, default 1), `limit` (number, default 10).
    - Headers: Authentication headers (handled by Supabase client/browser cookies).
- **Response**: `PaginatedPlansDto`
    ```json
    {
      "data": [ ... ],
      "pagination": {
        "totalItems": 20,
        "totalPages": 2,
        "currentPage": 1
      }
    }
    ```

## 8. User Interactions
1.  **Page Load**: The user navigates to `/plans`. The list loads automatically (skeleton state visible).
2.  **Pagination**: User clicks "Next" or a page number. The list updates to show the corresponding records.
3.  **View Details**: User clicks on a `PlanSummaryCard`. The browser navigates to `/plans/[id]`.
4.  **Create Plan (Empty State)**: If no plans exist, user clicks "Create New Plan" and is redirected to `/dashboard`.
5.  **Create Plan (Header)**: User clicks "Create New Plan" in the page header. Redirects to `/dashboard`.

## 9. Conditions and Validation
-   **Authentication**: The `index.astro` page must verify the user is logged in. If not, redirect to login.
-   **Data Integrity**: The `PlanSummaryCard` must safely handle `plan_data` parsing. Since `plan_data` is stored as JSON/JSONB, the component should verify the existence of the `introduction` field before rendering to avoid runtime errors.

## 10. Error Handling
-   **API Errors (500/400)**: Display a generic error message in the `PlanListContainer` (e.g., "Failed to load plans. Please try again.").
-   **Network Errors**: Handle fetch failures gracefully with a "Retry" button.
-   **Empty Data**: If the API returns an empty array, render the `EmptyState` component.

## 11. Implementation Steps

1.  **Backend Setup**:
    -   Create `src/pages/api/plans/index.ts`.
    -   Implement `GET` handler:
        -   Authenticate user.
        -   Fetch plans from `plans` table using Supabase client.
        -   Apply pagination (range).
        -   Return `PaginatedPlansDto`.

2.  **Component Creation**:
    -   Create `src/components/plans/EmptyState.tsx` (Link to `/dashboard`).
    -   Create `src/components/plans/PlanSummaryCard.tsx` (using Shadcn `Card`).
    -   Create `src/components/plans/PageHeader.tsx` (with Create button).
    -   Create `src/components/plans/PlanList.tsx`.
    -   Create `src/components/plans/PlanListContainer.tsx` (implement fetch logic).

3.  **Page Assembly**:
    -   Create `src/pages/plans/index.astro`.
    -   Import and mount `PlanListContainer`.
    -   Add `client:load` directive to ensure React hydration.

4.  **Integration & Testing**:
    -   Verify authentication redirect.
    -   Test pagination with > 10 mock plans.
    -   Verify empty state appearance and link to Dashboard.
    -   Verify header "Create New Plan" button links to Dashboard.
    -   Check responsiveness (grid layout) on mobile/desktop.
