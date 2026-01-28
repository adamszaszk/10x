# View Implementation Plan: Dashboard

## 1. Overview
The Dashboard is the core workspace for authenticated users. It serves two primary functions: 1) Initiating the AI plan generation process via a prominent input form, and 2) Providing quick access to recent plans and current usage quota. It also orchestrates the "Plan Preview" state, transiently displaying generated plans for review before they are saved or discarded.

## 2. View Routing
- **Path**: `/dashboard`
- **Protection**: Protected. Redirects to `/login` if unauthorized.

## 3. Component Structure
- `src/pages/dashboard.astro` (Page Controller)
    - `Layout` (Astro Layout)
        - `DashboardContainer` (React Container - `client:load`)
            - `QuotaIndicator` (React Presentational)
            - `GreetingHeader` (React Presentational)
            - `AIInputForm` (React Interactive)
            - `RecentPlansList` (React Presentational)
                - `PlanSummaryCard` (Shared Component)
            - `PlanPreview` (Ref: Plan Preview View Plan) - Conditionally rendered overlay

## 4. Component Details

### `src/components/dashboard/DashboardContainer.tsx`
- **Description**: The smart parent component. It holds the state for the `generatedPlan` and manages the transition between the "Input" mode and "Preview" mode. It also fetches the user's quota and recent plans on mount.
- **Main Elements**:
    - `div` wrapper.
    - Conditional Logic: If `generatedPlan` is present? Render `PlanPreview`. Else? Render Dashboard standard view (Quota, Form, Recent).
- **State**: 
    - `plan: GeneratedPlanDto | null`
    - `quota: number`
    - `recentPlans: PlanDto[]`
    - `isLoading`: boolean.
- **Handled Events**:
    - `onPlanGenerated(plan)`: Sets the `plan` state, triggering the Preview UI.
    - `onPlanSaved()` or `onPlanDiscarded()`: Clears the `plan` state, returning to Dashboard view, and re-fetches quota/recent plans.

### `src/components/dashboard/AIInputForm.tsx`
- **Description**: The primary interaction point. A large text area for user prompts.
- **Main Elements**:
    - `form`: Form element.
    - `Textarea` (Shadcn): Large, auto-resizing. Placeholder: "I want a weekend trip to..."
    - `Button`: "Generate Plan" (with Sparkles icon).
    - `span`: Character count or hints.
- **Validation**: Input must not be empty.
- **Interactions**: Calls `POST /api/ai/generate-plan`.

### `src/components/dashboard/QuotaIndicator.tsx`
- **Description**: Visual display of remaining monthly credits.
- **Main Elements**:
    - `Progress` (Shadcn): Bar showing usage.
    - `Text`: "15 / 20 generations left this month".
- **Props**: `used: number`, `limit: number`.

### `src/components/dashboard/RecentPlansList.tsx`
- **Description**: A shortened list/grid of the 3 most recently created plans.
- **Main Elements**:
    - `h2`: "Recent Plans".
    - `div` (Grid): Displaying `PlanSummaryCard` components.
    - `Link`: "View All" pointing to `/plans`.
- **Props**: `plans: PlanDto[]`.

## 5. Types
- `GeneratedPlanDto`: (as defined in `types.ts`)
- `DashboardDataViewModel`: Combine quota and recent plans?
    ```typescript
    type DashboardData = {
        generation_count: number;
        recent_plans: PlanDto[];
    }
    ```

## 6. State Management
- **DashboardContainer**:
    - Uses `useState` for `generatedPlan`.
    - Uses `useEffect` to fetch initial data (`/api/profile` for quota, `/api/plans?limit=3` for recent).
    - Uses `Mutation` (or simple async function) for the Generate action.

## 7. API Integration
- **Fetch Profile**: `GET /api/profile` (to get `generation_count`).
- **Fetch Recent Plans**: `GET /api/plans?limit=3&order=desc`.
- **Generate Plan**: `POST /api/ai/generate-plan`.
    - Request: `{ prompt: string }`
    - Response: `GeneratedPlanDto`

## 8. User Interactions
1.  **Generate Plan**:
    - User types text.
    - Clicks "Generate".
    - `AIInputForm` sets loading state.
    - API called.
    - Success: Lift state up to `DashboardContainer` -> `setGeneratedPlan(data)`.
    - UI switches to `PlanPreview`.
2.  **View Recent Plan**: User clicks a card -> Navigates to `/plans/[id]`.

## 9. Conditions and Validation
- **Quota Exceeded**: If `generation_count >= 20`, disable the `AIInputForm` button and show a message.
- **Empty Input**: Disable Generate button.

## 10. Error Handling
- **429 Too Many Requests**: If the API returns 429 during generation, display a specific "Quota Limit Reached" error.
- **500 Errors**: Generic "Something went wrong" toast/alert.

## 11. Implementation Steps
1.  Create `AIInputForm`.
2.  Create `QuotaIndicator`.
3.  create `RecentPlansList` reusing `PlanSummaryCard`.
4.  Implement `DashboardContainer` to fetch Profile (quota) and Plans.
5.  Implement the `handleGenerate` function calling the AI endpoint.
6.  Wire up the conditional rendering: Show `PlanPreview` (stub for now, or real component) when data exists.
7.  Integrate with `layouts/Layout.astro`.
