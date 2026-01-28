# UI Architecture for VibeTravels

## 1. UI Structure Overview

The VibeTravels user interface is structured into two distinct zones: the **Public Zone** for marketing and authentication, and the **Protected Zone (App)** for authenticated user interaction. The application utilizes a responsive, mobile-first design philosophy, leveraging Astro for static layout structure and React for dynamic, interactive components.

-   **Public Zone**: Focused on conversion and entry. Minimal navigation.
-   **Protected Zone**: Persistent application layout with global navigation. Contains the core functionality: Profile management, Plan generation, and Plan archiving.

## 2. View List

### 2.1. Public Views

#### Landing Page
-   **Path**: `/`
-   **Main Purpose**: Introduce the value proposition and drive user registration.
-   **Key Information**: App features, example plan snippet, "Get Started" CTA.
-   **Key Components**: `HeroSection`, `FeatureGrid`.
-   **Considerations**: High performance (static generation), accessible contrast for text.

#### Auth Page
-   **Path**: `/login` (handles both login and registration)
-   **Main Purpose**: Authenticate users.
-   **Key Information**: Email/Password fields, Error messages.
-   **Key Components**: `AuthCard` (Unified component with "Sign In" and "Sign Up" tabs).
-   **Considerations**:
    -   **UX**: Clear error feedback for failed login/registration.
    -   **Security**: HTTPS only, client-side validation before submission.

### 2.2. Protected Views (App)

#### Dashboard
-   **Path**: `/dashboard`
-   **Main Purpose**: The central hub for initiating plan generation and viewing quick status.
-   **Key Information**: User's current quota, AI Input field, summary of recent plans.
-   **Key Components**:
    -   `QuotaIndicator`: Visual display of remaining generations (e.g., "15/20").
    -   `AIInputForm`: Large text area for travel ideas.
    -   `RecentPlans`: Horizontal scroll or short list of the 3 most recent plans.
-   **Considerations**:
    -   **UX**: The input form is the "Hero" of this page.
    -   **Edge Cases**: Display "No plans yet" state if empty.

#### Profile Page (Onboarding)
-   **Path**: `/profile`
-   **Main Purpose**: Manage user preferences and personal details. Serves as the destination for post-registration onboarding.
-   **Key Information**: Travel Style, Traveler Type, Interests (tags), Past Travel Experiences.
-   **Key Components**:
    -   `PreferencesForm`: Form with validation using Zod.
    -   `TagInput`: For "Interests" and "Past Experiences".
    -   `SelectDropdown`: For "Travel Style" and "Traveler Type" (fetched from API).
-   **Considerations**:
    -   **UX**: If accessed during onboarding, show a "Complete Profile to Start" message.
    -   **Data**: Fetches reference data (`/api/travel-styles`, `/api/traveler-types`) on load.

#### My Plans Page
-   **Path**: `/plans`
-   **Main Purpose**: Archive of all saved travel plans.
-   **Key Information**: List of plans with Destination, Date Created, and a short snippet.
-   **Key Components**:
    -   `PlanList`: Vertical list using infinite scroll or pagination.
    -   `PlanSummaryCard`: Clickable card navigating to details.
-   **Considerations**:
    -   **Performance**: Efficient rendering of lists (virtualization if list grows large).
    -   **Empty State**: "You haven't saved any plans yet."

#### Plan Details Page
-   **Path**: `/plans/[id]`
-   **Main Purpose**: Read-only view of a specific, saved travel plan.
-   **Key Information**: Destination Name, Introduction, Why Visit, Things to Do, Itinerary.
-   **Key Components**:
    -   `PlanDisplay`: Reusable component to render the plan content.
    -   `DeleteButton`: Option to remove the plan.
-   **Considerations**:
    -   **Security**: Verify ownership before displaying (handled by API/RLS, but UI should handle 403/404 errors gracefully).

#### Plan Preview (Transient View)
-   **Path**: N/A (Overlay or State within Dashboard)
-   **Main Purpose**: Review the AI-generated plan before saving.
-   **Key Information**: The generated plan content, Disclaimer.
-   **Key Components**:
    -   `PlanDisplay`: Same component as Details page.
    -   `ActionToolbar`: Sticky footer/header with "Save" and "Discard" buttons.
-   **Considerations**:
    -   **State**: Data exists only in React state. Refreshing the page warns the user or loses data.
    -   **UX**: "Save" triggers `POST /api/plans`. "Discard" clears state.

## 3. User Journey Map

### 3.1. New User Onboarding
1.  **Landing**: User clicks "Get Started".
2.  **Auth**: User selects "Sign Up", enters credentials.
3.  **Redirect**: System creates account and redirects to `/profile`.
4.  **Onboarding**: User fills in mandatory Travel Style and Interests.
5.  **Completion**: User clicks "Save Profile" and is routed to `/dashboard`.

### 3.2. Plan Generation Flow (Core Loop)
1.  **Initiate**: On `/dashboard`, user types "Weekend trip to Paris" in `AIInputForm` and clicks "Generate".
2.  **Validation**: UI checks Quota. If 0, show "Quota Exceeded" modal.
3.  **Processing**: UI shows `SteppedLoader` (e.g., "Analyzing preferences...", "Consulting AI...", "Finalizing itinerary...").
4.  **Preview**: `PlanPreview` overlay appears with the generated content.
5.  **Decision**:
    -   **Save**: User clicks "Save". Data sent to API. Success toast appears. Redirect to `/plans/[new-id]`.
    -   **Discard**: User clicks "Discard". Confirmation modal appears. On confirm, overlay closes, returning to Dashboard input.

### 3.3. Returning User Access
1.  **Login**: User logs in at `/login`.
2.  **Dashboard**: Redirected to `/dashboard`.
3.  **Browse**: User clicks "My Plans" in navigation.
4.  **View**: User selects a plan from the list to view details at `/plans/[id]`.

## 4. Layout and Navigation Structure

### 4.1. Public Layout
-   **Header**: Logo (left), "Sign In" button (right).
-   **Footer**: Copyright, simple links.

### 4.2. App Layout (Protected)
-   **Top Bar (Mobile/Desktop)**: Logo, User Avatar (dropdown with "Profile", "Logout").
-   **Navigation**:
    -   **Desktop**: Sidebar or Top Navigation Bar containing:
        -   Dashboard (Home icon)
        -   My Plans (List icon)
        -   Profile (User icon)
    -   **Mobile**: Bottom Navigation Bar or Hamburger Menu.
-   **Content Area**: Central container for page views.

### 4.3. Navigation Logic
-   **Route Guards**: Astro Middleware checks `sb-access-token` cookie. If missing/invalid, redirect to `/login`.
-   **Active State**: Navigation links highlight based on current URL path.

## 5. Key Components

### 5.1. `PlanDisplay`
-   **Description**: The core component for rendering travel plans.
-   **Behavior**:
    -   **Desktop**: Renders as a structured document (Header, Intro, Grid for sections).
    -   **Mobile**: Renders sections (Why Visit, Itinerary) as **Accordions** to save vertical space.
    -   **Content**: Uses a Markdown renderer for rich text support from AI output.

### 5.2. `AIInputForm`
-   **Description**: The primary interaction point.
-   **Features**:
    -   Auto-expanding text area.
    -   Character count indicator.
    -   "Generate" button with loading state.
    -   Displays error inline if validation fails (empty input).

### 5.3. `SteppedLoader`
-   **Description**: A dynamic loading indicator to manage user expectations during the 10-30s AI generation process.
-   **Behavior**: Cycles through messages ("Reading profile...", "Finding destinations...", "Building itinerary...") to keep the user engaged.

### 5.4. `QuotaIndicator`
-   **Description**: Visual representation of usage limits.
-   **Behavior**:
    -   Green: > 5 remaining.
    -   Yellow: <= 5 remaining.
    -   Red: 0 remaining.
    -   Tooltip/Text: "Resets on [Date]".

### 5.5. `ToastNotification`
-   **Description**: Global feedback mechanism.
-   **Usage**:
    -   Success: "Plan saved successfully."
    -   Error: "Failed to generate plan. Please try again."
