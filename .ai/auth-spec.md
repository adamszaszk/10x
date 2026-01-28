# Technical Specification: Authentication & User Management (US-001, US-002)

## 1. User Interface Architecture

### Frontend Layer Modifications
To support the requirements of US-001 (Registration) and US-002 (Login), along with robust security practices, the frontend architecture will utilize Astro's Server-Side Rendering (SSR) capabilities combined with React islands for interactivity.

#### Pages
1.  **`/login`** (`src/pages/login.astro`):
    *   **Access**: Public.
    *   **Behavior**:
        *   Redirects to `/dashboard` if a valid session exists (checked via SSR).
        *   Renders the `AuthContainer` component for Login/Registration forms.
    *   **Layout**: Uses `Layout.astro` with a simplified header (no navigation links).

2.  **`/recover-password`** (New - `src/pages/recover-password.astro`):
    *   **Access**: Public.
    *   **Content**: A form to input email address for password reset link.
    *   **Behavior**: Calls Supabase `resetPasswordForEmail`.

3.  **`/reset-password`** (New - `src/pages/reset-password.astro`):
    *   **Access**: Public (requires valid recovery token in URL).
    *   **Content**: Form to enter a new password.
    *   **Behavior**: Calls Supabase `updateUser` to set the new password.

4.  **`/dashboard`, `/profile`, `/plans/*`**:
    *   **Access**: Protected.
    *   **Behavior**: Middleware will intercept requests. If no session, redirect to `/login`.

#### Components
1.  **`AuthContainer`** (`src/components/auth/AuthContainer.tsx`):
    *   **Role**: Orchestrator for auth state.
    *   **Updates**:
        *   Manage tabs for "Sign In" vs "Sign Up".
        *   Handle "Forgot Password" link switching to the recovery view.
        *   Accept existing `redirect` query params to handle deep-linking post-login.

2.  **Forms** (`src/components/auth/`):
    *   **`LoginForm.tsx`**:
        *   **Validation**: Zod schema (email format, password min length).
        *   **Action**: `supabase.auth.signInWithPassword`.
        *   **Success**: Redirect to `/dashboard`.
    *   **`RegisterForm.tsx`**:
        *   **Validation**: Zod schema (matching passwords).
        *   **Action**: `supabase.auth.signUp`.
        *   **Success**: Redirect to `/profile` (US-001: New users must fill preferences).
    *   **`ForgotPasswordForm.tsx`** (New):
        *   **Action**: `supabase.auth.resetPasswordForEmail`.

3.  **Layout & Navigation**:
    *   **`LandingHeader.astro`**:
        *   Update to check `Astro.locals.user`.
        *   **Guest**: Show "Sign In" / "Get Started".
        *   **Authenticated**: Show "Dashboard", "My Plans", "Profile", and "Sign Out" button.

### Validation & Error Handling
*   **Client-Side**: React Hook Form + Zod.
    *   *Email*: Valid email format.
    *   *Password*: Min 6 characters (Supabase default).
    *   *Confirm Password*: Must match password.
*   **Error Messages**: Displayed inline below form fields (e.g., "Invalid email", "User already exists").
*   **Global Errors**: Toast notifications for API failures (e.g., "Network error", "Too many attempts").

## 2. Backend Logic

### API Endpoints & Data Models
Although Supabase handles most auth logic on the client, server-side endpoints are required for callback handling and consistent session management in Astro SSR.

1.  **`/api/auth/callback`** (`src/pages/api/auth/callback.ts`):
    *   **Method**: GET.
    *   **Purpose**: Handles the server-side code exchange for **Password Reset** flows (PKCE).
    *   **Logic**: Exchanges the validation code for a session and sets cookies.
    *   **Redirect**: Redirects to the `next` path query param (e.g., `/reset-password`).

2.  **`/api/auth/signout`** (`src/pages/api/auth/signout.ts`):
    *   **Method**: GET/POST.
    *   **Purpose**: Clears the authentication cookies server-side.
    *   **Redirect**: To `/login`.

### Middleware (`src/middleware/index.ts`)
*   **Integration**: Replace standard `supabase-js` client with `@supabase/ssr` to properly handle cookie-based sessions in Astro.
*   **Logic**:
    1.  Create a Supabase Server Client using `createServerClient`.
    2.  Parse cookies from the request.
    3.  Call `supabase.auth.getUser()`.
    4.  Populate `context.locals.user` and `context.locals.session`.
    5.  **Protection Rule**: If the path starts with `/dashboard`, `/profile`, or `/plans` and `user` is null, redirect to `/login`.

### Server-Side Rendering Updates (@astro.config.mjs)
*   The project uses `output: 'server'` with the Node adapter.
*   **Implication**: All pages are dynamic by default.
*   **Optimization**: Public pages like Landing (`/`) should be explicitly marked `export const prerender = true` if they don't depend on user state, but since the Header adapts to login state, they must remain dynamic (or use client-side hydration for the header). Given the "VibeTravels" nature, dynamic rendering is preferred for the layout to avoid FOUC (Flash of Unauthenticated Content).

## 3. Authentication System (Supabase)

### Configuration
*   **Library**: Switch from `supabase-js` to `@supabase/ssr` package for robust cookie management in SSR environment.
*   **Persistance**: Cookies (HttpOnly, Secure, SameSite=Lax).
*   **Settings (Important)**: Explicitly **Disable Email Confirmations** in the Supabase Project Settings for this MVP. This ensures users are logged in immediately after registration (satisfying US-001) without needing to verify their email first.

### Flows
1.  **Registration (US-001)**:
    *   **Assumption**: Email confirmation is disabled (Auto-confirm enabled).
    *   Client calls `supabase.auth.signUp({ email, password })`.
    *   Supabase creates user in `auth.users` and immediately returns a valid session.
    *   Trigger: A Postgres trigger creates a corresponding record in `public.profiles` (or `users` table if using custom).
    *   **Post-Action**: Client detects session, redirects to `/profile`.

2.  **Login (US-002)**:
    *   Client calls `supabase.auth.signInWithPassword({ email, password })`.
    *   **Post-Action**: Client detects session, redirects to `/dashboard`.

3.  **Account Recovery**:
    *   **Request**: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '.../api/auth/callback?next=/reset-password' })`.
    *   **Update**: User clicks link -> Middleare processes code -> Redirects to `/reset-password` -> User submits new password -> `supabase.auth.updateUser({ password })`.

### Security Constraints
*   **RLS (Row Level Security)**:
    *   Users can only view/edit their own profile (`auth.uid() = id`).
    *   Users can only view/edit their own plans (`auth.uid() = user_id`).
*   **Cookies**: Managed strictly by `@supabase/ssr` helper methods to ensure security attributes are set correctly for the production environment.
