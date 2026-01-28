# Product Requirements Document (PRD) - VibeTravels (MVP)

## 1. Product Overview

VibeTravels is a Minimum Viable Product (MVP) for an innovative travel planning application. Its core purpose is to simplify the process of creating engaging and personalized travel itineraries. The application leverages the power of the Gemini 2.5 Pro AI model to transform users' simple, free-form text input about travel ideas into structured, detailed, and inspiring travel plans. By considering user-specific preferences, budget, and past experiences, VibeTravels aims to remove the friction and difficulty often associated with travel planning, making it a creative and effortless experience.

## 2. User Problem

The primary problem VibeTravels addresses is that planning interesting and well-organized trips is often a difficult, time-consuming, and overwhelming task. Potential travelers struggle with consolidating ideas, researching destinations, finding activities that match their interests and budget, and structuring all the information into a coherent itinerary. This can lead to decision fatigue and less enjoyable travel experiences. VibeTravels aims to solve this by providing an intelligent assistant that automates the heavy lifting of planning, allowing users to focus on the excitement of the journey ahead.

## 3. Functional Requirements

### 3.1. User Account Management
- FR-001: Users must be able to register for a new account using an email address and a password.
- FR-002: Users must be able to log in to their existing account.
- FR-003: The system must securely store user credentials.
- FR-021: Users must be able to request a password reset functionality via email.
- FR-022: Users must be able to set a new password after receiving a recovery link.

### 3.2. User Profile and Preferences
- FR-004: A dedicated user profile page must be available for managing travel preferences.
- FR-005: Users must be able to input and save their travel preferences, including:
    - Travel style (e.g., relaxation, adventure)
    - Interests (e.g., history, food, nature)
    - Past travel experiences (list of visited places)
    - Traveler type (e.g., solo, couple, family) - this is an optional field.
- FR-006: New users must be prompted to fill out their travel preferences immediately after completing registration.

### 3.3. AI Plan Generation
- FR-007: Users must be able to trigger an AI plan generation by providing a text input with their travel ideas.
- FR-008: The system will integrate with the Gemini 2.5 Pro AI model.
- FR-009: The AI prompt will be constructed using the user's text input (including natural language budget and duration) and their saved profile preferences.
- FR-010: For abstract destination requests, the AI will be instructed to suggest a location not present in the user's "past travel experiences."

### 3.4. Plan Viewing and Management
- FR-011: Generated plans will be displayed on a new, dedicated page.
- FR-012: The generated plan will be a read-only, structured document containing:
    - A large header with the destination's name.
    - A 3-5 sentence introductory paragraph.
    - Sections such as "Why Visit," "Things to Do," and a "Sample Itinerary."
- FR-013: After viewing a plan, the user must choose to either "Save" or "Discard" it.
- FR-014: Saved plans will be stored and accessible to the user in a list.
- FR-015: Discarded plans will be permanently deleted.

### 3.5. Usage Limits and Error Handling
- FR-016: A usage limit of 20 plan generations per user per month will be enforced.
- FR-017: The user's current usage quota (e.g., "15/20 plans left") must be clearly displayed in the user profile and near the "Generate Plan" button.
- FR-018: Each click on the "Generate Plan" button will count as one use, decrementing the user's quota.
- FR-019: The system must handle API errors gracefully by displaying user-friendly messages and implementing a retry mechanism for transient issues.
- FR-020: A disclaimer will be displayed with every generated plan, stating that the content is AI-generated and may contain inaccuracies.

## 4. Product Boundaries

### 4.1. In-Scope for MVP
- Email and password-based user authentication.
- Password recovery flow (email request + reset).
- User profile management for travel preferences.
- AI-powered generation of structured, read-only travel plans from a single text input.
- A hard usage limit of 20 generations per user per month.
- Mandatory save/discard action for every generated plan.
- A simple list view for all saved plans.

### 4.2. Out-of-Scope for MVP
- Social media logins (e.g., Google, Facebook).
- CRUD operations for travel notes (notes are ephemeral).
- Tagging or categorization of notes or plans.
- Sharing or collaborating on travel plans between users.
- Editing of AI-generated plans.
- Rich media support within plans (e.g., images, videos).
- Advanced logistical planning (e.g., flight/hotel booking, real-time scheduling).
- A history or "trash" for discarded plans.

## 5. User Stories

### 5.1. Account Management
- ID: US-001
- Title: New User Registration
- Description: As a new user, I want to create an account using my email and password so that I can save my travel plans and preferences.
- Acceptance Criteria:
    - A registration form is available with fields for email and password.
    - Upon successful registration, I am logged into the application.
    - I receive a confirmation that my account has been created.
    - After registration, I am immediately prompted to fill out my travel preferences.

- ID: US-002
- Title: User Login
- Description: As a returning user, I want to log in with my email and password to access my account.
- Acceptance Criteria:
    - A login form is available with fields for email and password.
    - Upon successful login, I am redirected to the main dashboard.
    - If I enter incorrect credentials, I see a clear error message.

- ID: US-011
- Title: Password Recovery
- Description: As a user, I want to be able to reset my password if I forget it, so I can regain access to my account.
- Acceptance Criteria:
    - There is a "Forgot Password" link on the login page.
    - I can enter my email to receive a password reset link.
    - Clicking the link takes me to a page where I can set a new password.
    - After setting a new password, I can log in with the new credentials.

### 5.2. Profile and Preferences
- ID: US-003
- Title: Manage Travel Preferences
- Description: As a user, I want to set and update my travel preferences in my profile so that the AI can generate plans tailored to my style.
- Acceptance Criteria:
    - I can access a "Profile" or "Preferences" page from the main navigation.
    - I can input and save my travel style, interests, past travel experiences, and traveler type.
    - My saved preferences are used for all future plan generations.

### 5.3. Plan Generation and Management
- ID: US-004
- Title: Generate a Travel Plan
- Description: As a user, I want to input my travel ideas to generate a detailed travel plan.
- Acceptance Criteria:
    - There is an input area to type my travel ideas.
    - There is a "Generate Plan" button to submit the text.
    - Clicking the button uses one of my monthly generation credits.
    - My usage quota is visible near the button.
    - The system sends my text input and profile preferences to the AI to generate a plan.

- ID: US-005
- Title: View a Generated Plan
- Description: As a user, I want to view the generated travel plan in a clear and structured format.
- Acceptance Criteria:
    - The plan is displayed on a new, dedicated page.
    - The plan includes a header, an introductory paragraph, and sections for "Why Visit," "Things to Do," and a "Sample Itinerary."
    - A disclaimer about potential AI inaccuracies is visible.

- ID: US-006
- Title: Save or Discard a Plan
- Description: As a user, I must decide whether to keep or delete a newly generated plan.
- Acceptance Criteria:
    - Two prominent buttons, "Save" and "Discard," are displayed on the plan page.
    - Clicking "Save" stores the plan in my account.
    - Clicking "Discard" permanently deletes the plan.
    - I cannot navigate away from the page without making a choice.

- ID: US-007
- Title: Access Saved Plans
- Description: As a user, I want to easily access all the plans I have previously saved.
- Acceptance Criteria:
    - I can navigate to a "My Plans" page.
    - All my saved plans are displayed in a list.
    - I can click on a plan in the list to view its details.

### 5.4. Edge Cases and Alternative Scenarios
- ID: US-008
- Title: Handle Abstract Destination
- Description: As a user, I want to get a relevant suggestion when I enter an abstract destination idea, like "a sunny beach town."
- Acceptance Criteria:
    - The AI generates a plan for a specific destination that matches the abstract request.
    - The suggested destination does not appear in my list of "past travel experiences."

- ID: US-009
- Title: Handle Usage Quota Depletion
- Description: As a user, I want to be clearly informed when I have run out of my monthly plan generations.
- Acceptance Criteria:
    - When my quota is zero, the "Generate Plan" button is disabled or clearly indicates I have no credits left.
    - If I attempt to generate a plan with no credits, I see a message explaining the limit and when it will reset.

- ID: US-010
- Title: Handle AI Service Failure
- Description: As a user, I want to see a helpful message if the AI fails to generate a plan.
- Acceptance Criteria:
    - If the AI service is unavailable or returns an error, a user-friendly message is displayed.
    - My generation credit is not consumed if the generation fails.

## 6. Success Metrics

- 6.1. Adoption of Preferences:
    - Metric: 90% of active users have filled out at least one of their travel preferences (style, interests, etc.).
    - Measurement: Query the user database to calculate the percentage of users with non-empty preference fields.

- 6.2. User Engagement:
    - Metric: 75% of active users generate 3 or more travel plans per year.
    - Measurement: Track the count of "generate plan" events per user over a 12-month period.
