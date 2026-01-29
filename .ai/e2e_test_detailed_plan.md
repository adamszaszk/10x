# E2E Test Detailed Plan: Existing User Journey

This document outlines a comprehensive, end-to-end "Happy Path" test scenario for VibeTravels using Playwright. It simulates an existing user logging in, generating a travel plan, saving it, verifying it in their list, deleting it, and finally logging out.

## Scenario: Login to Plan Management

### 1. Login
*   **Action**: Navigate to the Login Page (`/login`).
*   **Action**: Enter valid credentials for an existing test user (email and password) and submit the form.
*   **Check**: Verify the user is successfully redirected to the `/dashboard`.

### 2. Dashboard & Plan Generation
*   **Check**: Verify the **Quota Indicator** is visible and shows a valid balance (e.g., > 0).
*   **Action**: In the **AI Input field**, type a specific travel request: *"A 3-day weekend trip to Kyoto, Japan focusing on temples and sushi."* Click the **"Generate Plan"** button.
*   **Check**: Verify the loading state appears (e.g., `SteppedLoader` text like "Analyzing preferences...").
*   **Check**: Wait for the **Plan Preview** overlay/modal to appear containing the generated content.

### 3. Plan Review & Saving
*   **Check**: Verify the Preview contains core elements: a Header (e.g., related to "Kyoto") and sections like "Why Visit" or "Itinerary".
*   **Action**: Click the **"Save Plan"** button.
*   **Check**: Verify a success toast notification appears.
*   **Check**: Verify the user is redirected to the specific Plan Details page (`/plans/[id]`).

### 4. Verification & Navigation
*   **Check**: On the Plan Details page, confirm the title and content generally match the request.
*   **Action**: Click the **"My Plans"** link in the main navigation.
*   **Check**: Verify the user is on the `/plans` list page.
*   **Check**: Confirm the newly created plan appears in the list with the correct date/title.

### 5. Cleanup & Logout
*   **Action**: Click on the newly created plan to return to its details page.
*   **Action**: Click the **"Delete Plan"** button and confirm the action in the warning modal.
*   **Check**: Verify redirection back to `/plans`.
*   **Check**: Verify the specific plan is removed from the list.
*   **Action**: Open the user menu and click **"Sign Out"**.
*   **Check**: Verify the user is redirected back to the Landing/Login page and can no longer access protected routes (e.g., `/dashboard` redirects to login).
