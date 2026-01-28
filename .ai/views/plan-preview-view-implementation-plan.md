# View Implementation Plan: Plan Preview (Transient View)

## 1. Overview
The Plan Preview is a transient state/view that appears immediately after the AI successfully generates a travel plan. It allows the user to review the generated content before deciding to persist it to the database ("Save") or reject it ("Discard"). It shares the visual rendering component with the Plan Details page but includes a unique action toolbar.

## 2. View Routing
- **Path**: N/A. It is a state displayed within `/dashboard` (or potentially a client-side route like `/dashboard?preview=true`, but state is preferred to prevent navigation issues).

## 3. Component Structure
- `DashboardContainer` (Parent - See Dashboard Plan)
    - `PlanPreviewContainer` (React Component)
        - `PlanDisplay` (Shared Component - See Plan Details Plan)
        - `ActionToolbar` (Sticky Footer/Header)
            - `Button` ("Discard" - Variant: Ghost/Outline)
            - `Button` ("Save Plan" - Variant: Default)
        - `DisclaimerBanner` (React Presentational)

## 4. Component Details

### `src/components/plans/PlanPreviewContainer.tsx`
- **Description**: Wrapper for the preview. It receives the ephemeral `GeneratedPlanDto` and displays it.
- **Props**: 
    - `plan: GeneratedPlanDto`
    - `onSave: () => Promise<void>`
    - `onDiscard: () => void`
    - `isSaving: boolean`
- **Main Elements**:
    - `div`: Full-screen or large overlay container.
    - `PlanDisplay`: Renders the content.
    - `ActionToolbar`: Fixed position or bottom of card.

### `src/components/plans/ActionToolbar.tsx`
- **Description**: Contains the primary actions.
- **Main Elements**:
    - `Button` (Discard): Triggers `onDiscard`.
    - `Button` (Save): Triggers `onSave`.
- **UX**: Save button should show loading spinner when `isSaving` is true.

### `src/components/common/DisclaimerBanner.tsx`
- **Description**: Displays the required AI discovery (`FR-020`).
- **Text**: "This content is AI-generated and may contain inaccuracies. Please verify important details."
- **Style**: Subtle alert or banner at the top/bottom.

## 5. Types
- `GeneratedPlanDto`: (Existing in types.ts).
- `CreatePlanCommand`: Used for the save operation payload.

## 6. State Management
- **Controlled by Parent**: This component is largely controlled by `DashboardContainer`. It doesn't hold its own data, it just triggers callbacks.

## 7. API Integration
- **Save Operation**:
    - `POST /api/plans`
    - Payload: `CreatePlanCommand` (`{ destination_name: plan.destination_name, plan_data: plan.plan_data }`)
    - Response: `PlanDto` (Saved plan).

## 8. User Interactions
1.  **Review**: User reads the plan.
2.  **Discard**: 
    - User clicks Discard.
    - `onDiscard` callback fires.
    - Parent clears state. View reverts to Dashboard form.
3.  **Save**:
    - User clicks Save.
    - `onSave` fires.
    - Parent calls API.
    - Success: Redirect to the newly created plan's detail page (`/plans/[id]`) OR show success toast and return to Dashboard list. (PRD FR-014 implies list, FR-006 says "Make a choice"). *Decision*: Redirect to the *list* or *details* is standard. Let's redirect to `/plans` (My Plans) to confirm it is there, or `/plans/[id]` to view the permanent version. Redirecting to `/plans` seems like a good "Closure" to the process.

## 9. Conditions and Validation
- **Prevent Navigation**: Optionally warn user if they try to browse away/refresh while looking at a preview (Unsaved changes).

## 10. Error Handling
- **Save Failure**: If `POST /api/plans` fails, show error toast. Do NOT clear the preview, allow user to try again.

## 11. Implementation Steps
1.  Implement `DisclaimerBanner.tsx`.
2.  Create `PlanPreviewContainer.tsx`.
3.  Reuse `PlanDisplay` (ensure it handles `GeneratedPlanDto` structure, which matches `PlanDto` structure for `plan_data`).
4.  Implement `ActionToolbar`.
5.  Integrate into `DashboardContainer` (The "Parent" logic was defined in the Dashboard Implementation Plan).
