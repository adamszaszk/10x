# View Implementation Plan: Plan Details Page

## 1. Overview
The Plan Details Page displays the full content of a saved travel plan. It is a read-only view that allows users to access the itinerary they generated and saved previously. It also provides the option to delete the plan.

## 2. View Routing
- **Path**: `/plans/[id]`
- **Protection**: Protected.
- **Ownership Check**: API returns 403 if user doesn't own the plan; UI must handle this (likely 404/403 treated same -> Redirect or Error Page).

## 3. Component Structure
- `src/pages/plans/[id].astro` (Page Controller - SSR)
    - `Layout`
    - `PlanDetailsContainer` (React `client:load` - mainly for the Delete action interaction, though display could be static, the delete action requires client JS)
        - `PlanHeader` (Destination, Date)
            - `DeletePlanButton` (AlertDialog trigger)
        - `PlanDisplay` (Shared Component - The core content)
            - `Section` (Intro)
            - `Section` (Why Visit)
            - `Section` (Things to Do)
            - `Section` (Itinerary)

## 4. Component Details

### `src/pages/plans/[id].astro`
- **Description**: Server-side page. It can optionally fetch the plan data on the server side for SEO/Performance using the ID param, and pass it to the React container as initial data.
- **Actions**: Reads `Astro.params.id`. Fetches data from specific Supabase query (or reuses API logic internally if possible, but standard is fetch from DB).
- **Validation**: If plan not found or not owned, return 404 Response.

### `src/components/plans/PlanDetailsContainer.tsx`
- **Description**: Wraps the display. Handles the "Delete" state and action.
- **Props**: `plan: PlanDto`.
- **Main Elements**:
    - `PlanHeader`: Flex row with Title and Actions.
    - `PlanDisplay`: The heavy content renderer.
- **Interactions**:
    - `handleDelete`: Calls API to delete, then redirects to `/plans`.

### `src/components/plans/PlanDisplay.tsx` (Shared with Preview)
- **Description**: Pure component for rendering the `jsonb` content of a plan.
- **Main Elements**:
    - `div` container.
    - `Markdown` or `RichText` rendering for the plan sections.
    - Typography styles (`prose` from Tailwind) for readability.
- **Props**: `data: PlanDto['plan_data']`.

### `src/components/plans/DeletePlanButton.tsx`
- **Description**: A button that opens a confirmation dialog.
- **Main Elements**:
    - `AlertDialog` (Shadcn).
    - `Trigger`: Button "Delete Plan" (Destructive variant).
    - `Content`: "Are you sure? This cannot be undone."
    - `Action`: Confirms delete.
- **Events**: `onConfirm`.

## 5. Types
- `PlanDto` (Existing).

## 6. State Management
- **Local**: `isDeleting` state in `PlanDetailsContainer` to show loading during deletion.

## 7. API Integration
- **Fetch**: Managed by Astro SSR (`context.locals.supabase...`).
- **Delete**:
    - `DELETE /api/plans/[id]`
    - On Success: `window.location.href = '/plans'`

## 8. User Interactions
1.  **Read**: User scrolls through content.
2.  **Delete**: User clicks Delete -> Confirms in Modal -> Redirected to list.

## 9. Conditions and Validation
- **ID Validation**: Valid UUID check in Astro route.

## 10. Error Handling
- **404**: If ID doesn't exist, show 404 page.

## 11. Implementation Steps
1.  Implement `PlanDisplay.tsx` (critical, reused in Preview). Ensure it handles the JSON structure from `GeneratedPlanDto`.
2.  Implement `DeletePlanButton.tsx` with Shadcn Alert Dialog.
3.  Create `src/pages/plans/[id].astro` with SSR logic to fetch the specific plan.
4.  Handle the layout and passing data to `PlanDetailsContainer`.
