# View Implementation Plan: Auth Page

## 1. Overview
The Auth Page handles user authentication for verify entry into the application. It provides a unified card interface that toggles between "Sign In" and "Sign Up" modes. It interacts with Supabase Auth to establish a session and redirects users to the appropriate page upon success (`/profile` for new registrations, `/dashboard` for logins).

## 2. View Routing
- **Path**: `/login`
- **Protection**: Public.
- **Redirect**: If the user is already authenticated (checked via middleware/client check), redirect to `/dashboard` immediately.

## 3. Component Structure
- `src/pages/login.astro` (Page wrapper)
    - `Layout` (Astro Layout - simplified navigation?)
        - `AuthContainer` (React Container - `client:load`)
            - `AuthCard` (Shadcn Card)
                - `Tabs` (Shadcn Tabs: "Login" | "Register")
                - `LoginForm` (React Component)
                - `RegisterForm` (React Component)

## 4. Component Details

### `src/pages/login.astro`
- **Description**: Static wrapper for the authentication logic. 
- **Main Elements**:
    - `Layout`: Wraps content.
    - `AuthContainer`: Client-side interactivity.
- **Validation**: Checks `context.locals.supabase.auth.getSession()` and redirects to `/dashboard` if true.

### `src/components/auth/AuthContainer.tsx`
- **Description**: Manages the high-level state of the auth flow, specifically the active tab (Login vs Register) and orchestrates the redirect logic after successful auth.
- **Main Elements**:
    - `div`: Centered layout container.
    - `AuthCard`: The visual container.
- **State**: `activeTab` ('login' | 'register').
- **Handled Events**: 
    - `onAuthSuccess`: Callback passed to forms to trigger redirect.

### `src/components/auth/LoginForm.tsx`
- **Description**: Form for existing users to sign in.
- **Main Elements**:
    - `form`: HTML form element.
    - `Input` (Email), `Input` (Password).
    - `Button`: "Sign In".
    - `Alert`: Error display.
- **Validation**: Email format, Password required.
- **Interactions**: Calls `supabase.auth.signInWithPassword`.

### `src/components/auth/RegisterForm.tsx`
- **Description**: Form for new user registration.
- **Main Elements**:
    - `form`: HTML form element.
    - `Input` (Email), `Input` (Password), `Input` (Confirm Password).
    - `Button`: "Sign Up".
    - `Alert`: Error display.
- **Validation**: Email format, Password strength (min count), Passwords match.
- **Interactions**: Calls `supabase.auth.signUp`.

## 5. Types
- **ViewModel**:
    - `AuthCredentials`: `{ email: string; password: string; }`

## 6. State Management
- **Local State**: `email`, `password`, `isLoading`, `error` within the form components.
- **Library**: Supabase Client (initialized in `src/db/supabase.client.ts`).

## 7. API Integration
- **Supabase Auth API**:
    - `signInWithPassword({ email, password })`
    - `signUp({ email, password })`
- **Response**: `AuthResponse` from Supabase (contains `data.user` and `data.session` or `error`).

## 8. User Interactions
1.  **Switch Tabs**: User clicks "Sign Up" tab -> Swaps form component.
2.  **Submit Login**: 
    - Validates inputs.
    - Shows loading spinner on button.
    - Calls Supabase.
    - On Success: Redirect to `/dashboard`.
    - On Error: Display error alert (e.g., "Invalid credentials").
3.  **Submit Register**:
    - Validates inputs (and password match).
    - Shows loading spinner.
    - Calls Supabase.
    - On Success: Redirect to `/profile` (Onboarding flow).
    - On Error: Display error alert (e.g., "User already exists").

## 9. Conditions and Validation
- **Password Match**: Confirmed in `RegisterForm`.
- **Empty Fields**: Prevent submission.

## 10. Error Handling
- **Auth Errors**: Catch errors from Supabase client (e.g., 400 Bad Request) and display the `error.message` in a UI Alert component within the form.

## 11. Implementation Steps
1.  Create `src/components/auth`.
2.  Implement `LoginForm.tsx` and `RegisterForm.tsx` using Shadcn `Input` and `Button`.
3.  Implement `AuthContainer.tsx` with Shadcn `Tabs` to switch between forms.
4.  Implement `src/pages/login.astro` and verify redirects for already logged-in users.
5.  Test Login flow (ensure redirect to Dashboard).
6.  Test Register flow (ensure redirect to Profile).
