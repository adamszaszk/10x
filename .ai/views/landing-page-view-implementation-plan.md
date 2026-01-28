# View Implementation Plan: Landing Page

## 1. Overview
The Landing Page is the public entry point for VibeTravels. Its primary purpose is to convert visitors into registered users by effectively communicating the application's value proposition: simplifying travel planning with AI. As a public page, it prioritizes performance, accessibility, and clear Calls to Action (CTAs).

## 2. View Routing
- **Path**: `/`
- **Protection**: Public. No authentication required.

## 3. Component Structure
- `src/pages/index.astro` (Page Controller)
    - `Layout` (Astro Layout)
        - `HeroSection` (Astro Component)
            - `Button` (Shadcn UI - Link variant)
        - `FeatureGrid` (Astro Component)
            - `FeatureCard` (Astro Component)
        - `HowItWorksSection` (Astro Component) 

## 4. Component Details

### `src/pages/index.astro`
- **Description**: The main entry point. Renders the static landing page structure.
- **Main Elements**:
    - `Layout`: Provides the HTML shell, navbar (with "Login" button), and footer.
    - `main`: Semantic wrapper for the page content.
    - `HeroSection`, `FeatureGrid`, `HowItWorksSection`: Sectional components.
- **Handled Events**: None (Static).
- **Validation**: None.
- **Types**: None.

### `src/components/landing/HeroSection.astro`
- **Description**: The "above the fold" section. Contains the main headline, subheadline, and primary "Get Started" CTA.
- **Main Elements**:
    - `h1`: "Your AI Travel Companion" (or similar copy).
    - `p`: Value prop description.
    - `a` (styled as Button): Links to `/login`.
    - `Image` (Astro Assets): An inspiring travel illustration or screenshot.
- **Props**: None.

### `src/components/landing/FeatureGrid.astro`
- **Description**: A grid layout displaying key features of the application (e.g., "Personalized Itineraries", "Smart Budgeting").
- **Main Elements**:
    - `section`: Container.
    - `div` (Grid): Responsive grid (1 col mobile, 3 cols desktop).
    - `FeatureCard` (Repeated).
- **Props**: None.

### `src/components/landing/FeatureCard.astro`
- **Description**: Displays a single feature with an icon, title, and short description.
- **Main Elements**:
    - `div`: Card container.
    - `Icon` (Lucide React or Astro Icon).
    - `h3`: Feature title.
    - `p`: Feature description.
- **Props**:
    - `title: string`
    - `description: string`
    - `icon: string` (Icon name)

## 5. Types
No specific TS types or DTOs involved for this static view apart from component props.

## 6. State Management
- **Stateless**: This view is fully static (`SSG`). No client-side state management is required.

## 7. API Integration
- None.

## 8. User Interactions
- **Click "Get Started" / "Login"**: Navigates the user to `/login`.

## 9. Conditions and Validation
- None.

## 10. Error Handling
- None required for static content.

## 11. Implementation Steps
1.  Create `src/components/landing` directory.
2.  Implement `FeatureCard.astro` with props for flexibility.
3.  Implement `FeatureGrid.astro` mock data array and map to `FeatureCard`.
4.  Implement `HeroSection.astro` with clear typography and the CTA button linking to `/login`.
5.  Compose `src/pages/index.astro` using `Layout` and the new sections.
6.  Verify responsiveness on mobile and desktop.
