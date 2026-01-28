# Test Plan: VibeTravels (MVP)

## 1. Introduction and Objectives
The objective of this Test Plan is to define the strategy, scope, and approach for validating the **VibeTravels** application (MVP). This document aims to ensure that the application meets the functional requirements defined in the PRD, functions correctly across the specified tech stack (Astro 5, React 19, Supabase), and delivers a reliable user experience, particularly regarding AI interactions.

**Key Goals:**
- Verify the core functionality: User Authentication, Plan Generation (AI), Plan Management, and Quota System.
- Ensure stability and graceful error handling for external dependencies (OpenRouter/Gemini AI, Supabase).
- Validate the security of user data through Supabase Row Level Security (RLS) policies.
- Confirm strict adherence to the specialized "Hybrid" architecture (Astro static pages + React islands).

## 2. In-Scope / Out-of-Scope

### 2.1 In-Scope
- **Frontend Functionality:** Verification of all UI components (Shadcn/ui), React interactivity (Forms, Plan Display), and Astro page routing.
- **Backend Logic:** API endpoints in `src/pages/api` (Profile, Travel Styles, AI Generation).
- **Authentication:** Registration, Login, Password Reset, and Session Management.
- **Database:** Data persistence, retrieval, and RLS policies for `Plans` and `Profiles`.
- **AI Integration:** Input validations, prompt construction, response parsing, and error handling for `Gemini 2.5 Pro`.
- **Business Logic:** Usage limits (20 plans/month) and quota decrementing.

### 2.2 Out-of-Scope
- **Performance Testing of External APIs:** We will not test the latency/throughput of OpenRouter or Supabase themselves, only our application's handling of their responses.
- **Social Authentication:** Not implemented in MVP.
- **Payment Processing:** Not included in MVP.
- **Mobile Native App Testing:** Focus is on Responsive Web Design (Mobile Web).

## 3. Test Strategy & Types

### 3.1 Unit Testing
Focus on individual functions and isolated components.
- **Target:** `src/lib/utils.ts`, `src/lib/services/ai.service.ts`, React components in `src/components/**`.
- **Approach:** 
    - Mock Supabase client to test data transformation and state logic.
    - Mock `OpenRouter` responses to test `ai.service.ts` parsing logic without incurring costs.
    - Test React components (e.g., `AIInputForm`, `PlanDisplay`) for rendering and event handling.

### 3.2 Integration Testing
Focus on the interaction between modules and API endpoints.
- **Target:** `src/pages/api/**`, Database interactions.
- **Approach:**
    - Validate API routes (`api/ai/generate-plan`) integrate correctly with the Service layer and Database.
    - Test **RLS Policies**: Ensure User A cannot access User B's plans via direct DB queries.
    - verify the Quota decrement logic: Generate Plan -> AI Success -> DB Update (Quota -1).

### 3.3 End-to-End (E2E) Testing
Focus on critical user journeys from the browser perspective.
- **Target:** Full application flow.
- **Approach:**
    - Use mocked AI responses for deterministic results in CI pipeline.
    - **Critical Path:** Register -> Set Preferences -> Generate Plan -> Save Plan -> View in Dashboard.

### 3.4 User Interface (UI) / Accessibility Testing
- Verify responsiveness (Tailwind 4) on Mobile, Tablet, and Desktop.
- Check Accessibility (ARIA labels) for Shadcn/ui components (Dialogs, Forms).

## 4. Test Scenarios

### 4.1 Authentication & Profile (FR-001 - FR-006)
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AUTH-001 | User registers with valid email/password | Account created, redirected to Onboarding/Profile settings. |
| AUTH-002 | User attempts login with invalid credentials | Error message displayed, access denied. |
| AUTH-003 | User resets password via email link | Email received, new password allows login. |
| PROF-001 | User saves Travel Preferences (Style, Interests) | Data persisted to Supabase `profiles` table. |

### 4.2 AI Plan Generation (FR-007 - FR-010, FR-016 - FR-019)
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| GEN-001 | User generates plan with valid quota | AI request sent, Loading state shown, Quota decremented by 1. |
| GEN-002 | User generates plan with **0 Quota** | "Generate" button disabled or error shown. No API call made. |
| GEN-003 | AI Service Timeout / Error (500) | User sees friendly error message ("Try again"). Quota **NOT** decremented. |
| GEN-004 | User inputs abstract destination ("Sunny beach") | AI suggests specific location (e.g., "Mallorca") and structures plan. |
| GEN-005 | User inputs unsafe/restricted content | App handles refusal gracefuly (if AI filters trigger). |

### 4.3 Plan Management (FR-011 - FR-015)
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| PLAN-001 | User views generated plan | Plan rendered with correct formatting (Header, Itinerary). |
| PLAN-002 | User clicks "Save" | Plan saved to `plans` table, user redirected to Dashboard. |
| PLAN-003 | User clicks "Discard" | Plan removed from temporary state, not saved to DB. |
| PLAN-004 | User views "My Plans" list | List displays saved plans. Clicking one opens details. |

## 5. Test Environment

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| **Local (Dev)** | Developer testing, Unit tests | Local Supabase/Docker, Mocked AI or Dev API Key. |
| **CI (GitHub Actions)** | Automated Unit, Lint, Build check | Mocked Supabase, Mocked AI (No external calls). |
| **Staging** | E2E, Integrated testing | Linked to "Staging" Supabase project. Real AI calls (capped budget). |
| **Production** | Final User Acceptance | Production Supabase, Live AI API. |

## 6. Tools

- **Unit/Component Testing:** `Vitest` + `React Testing Library`.
- **E2E Testing:** `Playwright` (Recommended for modern React/Astro apps).
- **Linting/Static Analysis:** `ESLint`, `TypeScript` compiler checks.
- **Database Management:** Supabase Dashboard / SQL Editor for verifying data states.
- **CI/CD:** GitHub Actions.

## 7. Schedule

1.  **Phase 1: Unit & Component Tests** (Concurrent with Development)
    - Setup Vitest.
    - Cover Utils, Schemas (Zod), and UI Components.
2.  **Phase 2: Integration & API Tests** (Post-Backend Implementation)
    - Test `src/pages/api` endpoints.
    - Validate Supabase RLS policies.
3.  **Phase 3: E2E & Critical Flows** (Pre-Release)
    - Implement Playwright flows for Auth and Plan Generation.
4.  **Phase 4: Bug Bash / Exploratory** (1 week before launch)
    - Manual testing of edge cases and UI responsiveness.

## 8. Acceptance Criteria

- **Code Coverage:** Minimum 70% unit test coverage for `src/lib` and `src/pages/api`.
- **Critical Bugs:** 0 Open Critical/Blocker bugs.
- **Pass Rate:** 100% pass rate for automated E2E Critical Path tests.
- **Performance:** Plan generation loading state handles delays >10s gracefully.
- **Compliance:** All AI-generated plans display the required disclaimer.

## 9. Roles and Responsibilities

- **Developer:**
    - Write Unit tests and Component tests.
    - Ensure CI pipeline passes before merging PRs.
- **QA Engineer (or Dev/QA Role):**
    - Create and maintain E2E test scenarios.
    - Perform manual exploratory testing.
    - Validate RLS security policies.
- **Product Owner:**
    - Approve User Stories and final Acceptance Criteria.

## 10. Defect Reporting Procedure

All defects should be logged in the project's Issue Tracker (GitHub Issues) with the following format:
1.  **Title:** Concise description of the failure.
2.  **Severity:** Critical / Major / Minor.
3.  **Steps to Reproduce:** Numbered list.
4.  **Expected Result:** What should have happened.
5.  **Actual Result:** What actually happened.
6.  **Environment:** (e.g., Local, Staging, Browser version).
7.  **Evidence:** Screenshots, Logs, or Screen recording.
