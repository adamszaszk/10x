# Minimal E2E Test Plan: Quick Smoke Test

This document outlines a minimal "smoke test" scenario for VibeTravels using Playwright. It focuses on verifying the core loop (Auth -> Create -> Save -> Delete) without detailed UI validation.

## Scenario: Quick Smoke Test

### 1. Login & Generate
*   **Action**: Log in with existing user credentials.
*   **Action**: On the Dashboard, type a simple prompt (e.g., "Paris trip") and click "Generate Plan".
*   **Action**: When the result appears, immediately click "Save Plan".

### 2. Verify & Cleanup
*   **Check**: Verify the browser redirects to a Plan Details page (`/plans/[id]`).
*   **Action**: Click "Delete Plan" and confirm.
*   **Check**: Verify redirection to the plan list or dashboard, ensuring the system didn't crash.
