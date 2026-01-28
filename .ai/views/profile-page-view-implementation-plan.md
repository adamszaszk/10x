# View Implementation Plan: Profile Page (Onboarding)

## 1. Overview
The Profile Page allows users to manage their personal travel preferences. Crucially, it serves as the mandatory onboarding destination for new users, ensuring they provide essential data (Travel Style, Interests) before accessing the rest of the application.

## 2. View Routing
- **Path**: `/profile`
- **Protection**: Protected.
- **Onboarding Logic**: If a user has incomplete preferences, other pages (like Dashboard) might redirect here (middleware dependent, but UI should support the "First usage" context).

## 3. Component Structure
- `src/pages/profile.astro`
    - `Layout`
    - `ProfileContainer` (React `client:load`)
        - `PageHeader` (Title + Description)
        - `ProfileForm` (React Interactive)
            - `Select` (Shadcn - Travel Style)
            - `Select` (Shadcn - Traveler Type)
            - `TagInput` (Custom - Interests)
            - `TagInput` (Custom - Past Experiences)
            - `Button` ("Save Profile")

## 4. Component Details

### `src/components/profile/ProfileContainer.tsx`
- **Description**: Fetches existing profile data and reference options (styles/types) to populate the form.
- **Main Elements**:
    - Loading State (Skeleton).
    - `ProfileForm`.
- **State**: `profile: ProfileDto`, `styles: TravelStyleDto[]`, `types: TravelerTypeDto[]`.

### `src/components/profile/ProfileForm.tsx`
- **Description**: The main form for editing preferences.
- **Main Elements**:
    - `Form` (Shadcn/React Hook Form + Zod).
    - `FormField` for Travel Style (Select).
    - `FormField` for Traveler Type (Select).
    - `FormField` for Interests (Tag/Array Input).
    - `FormField` for Past Experiences (Tag/Array Input).
- **Validation**:
    - `travel_style_id`: Required.
    - `interests`: At least 1 item required.
- **Props**: 
    - `initialData`: ProfileDto
    - `travelStyles`: TravelStyleDto[]
    - `travelerTypes`: TravelerTypeDto[]

### `src/components/ui/TagInput.tsx` (New Component)
- **Description**: A custom input component that allows users to type text and press Enter to add it as a "chip" or "tag". Needed for "Interests" and "Past Experiences".
- **Main Elements**:
    - `input` text.
    - `div` container for chips.
    - `Badge` (Shadcn) for each selected item with "X" to remove.
- **Events**: `onAdd(string)`, `onRemove(string)`.

## 5. Types
- `ProfileFormValues`: Matches `UpdateProfileCommand` but strictly typed for the form state.
- `TagInputProps`: `{ value: string[], onChange: (val: string[]) => void, placeholder: string }`

## 6. State Management
- **React Hook Form**: Manages the transient form state.
- **Container**: Manages the data fetching state.

## 7. API Integration
- **Fetch Data**:
    - `GET /api/profile`
    - `GET /api/travel-styles`
    - `GET /api/traveler-types`
- **Update**:
    - `PATCH /api/profile`
    - Body: `UpdateProfileCommand`

## 8. User Interactions
1.  **Load**: Form pre-fills with current database values.
2.  **Edit**: User changes dropdowns, adds/removes tags.
3.  **Save**:
    - User clicks Save.
    - UI validates.
    - API PATCH call.
    - On Success: Show toast "Profile Saved". If `redirectOnSave` (prop for onboarding context) is true, redirect to `/dashboard`.

## 9. Conditions and Validation
- **Mandatory Fields**: Travel Style and Interests must be populated to be considered "valid" for the app's AI to work.

## 10. Error Handling
- **Load Error**: If reference data fails to load, disable form and show retry.
- **Save Error**: Display Validation errors from API or generic network error.

## 11. Implementation Steps
1.  Create `TagInput.tsx` component (reusable).
2.  Implement `src/pages/api/travel-styles.ts` and `src/pages/api/traveler-types.ts` endpoints (if not already done) to serve data.
3.  Create `ProfileForm.tsx` with Zod schema.
4.  Create `ProfileContainer.tsx` to handle the multiple data fetches (`Promise.all`).
5.  Compose `src/pages/profile.astro`.
