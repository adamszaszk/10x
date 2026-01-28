# VibeTravels

VibeTravels is a Minimum Viable Product (MVP) for an innovative travel planning application. Its core purpose is to simplify the process of creating engaging and personalized travel itineraries. The application leverages the power of the Gemini 2.5 Pro AI model to transform users' simple, free-form text input about travel ideas into structured, detailed, and inspiring travel plans.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

### Frontend
- **Framework**: [Astro 5](https://astro.build/)
- **UI Library**: [React 19](https://react.dev/) for interactive components
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Library**: [Shadcn/ui](https://ui.shadcn.com/)

### Backend
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth

### AI
- **Service**: [OpenRouter.ai](https://openrouter.ai/) for access to various AI models, including Google Gemini.

### CI/CD & Hosting
- **CI/CD**: GitHub Actions
- **Hosting**: DigitalOcean (via Docker image)

## Getting Started Locally

To set up and run this project locally, follow these steps:

1.  **Clone the repository:**
    ````bash
    git clone <repository-url>
    cd 10x
    ````

2.  **Set up Node.js:**
    The project requires a specific version of Node.js. It's recommended to use a version manager like `nvm`.
    ````bash
    nvm use
    ````
    This will use the version specified in the `.nvmrc` file (`22.14.0`).

3.  **Install dependencies:**
    ````bash
    npm install
    ````

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables (e.g., Supabase keys, OpenRouter API key).

5.  **Run the development server:**
    ````bash
    npm run dev
    ````
    The application will be available at `http://localhost:4321`.

## Available Scripts

The following scripts are available in the `package.json`:

-   `npm run dev`: Starts the Astro development server.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Serves the production build locally for preview.
-   `npm run astro`: Accesses the Astro CLI.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run lint:fix`: Lints the codebase and automatically fixes issues.
-   `npm run format`: Formats the code using Prettier.

## Project Scope

### In-Scope for MVP

-   Email and password-based user authentication.
-   User profile management for travel preferences.
-   AI-powered generation of structured, read-only travel plans from a single text input.
-   A hard usage limit of 20 generations per user per month.
-   Mandatory save/discard action for every generated plan.
-   A simple list view for all saved plans.

### Out-of-Scope for MVP

-   Social media logins (e.g., Google, Facebook).
-   Editing of AI-generated plans.
-   Sharing or collaborating on travel plans.
-   Rich media support within plans (e.g., images, videos).
-   Advanced logistical planning (e.g., flight/hotel booking).
-   A history or "trash" for discarded plans.

## Project Status

This project is currently in the **Minimum Viable Product (MVP)** development phase. The focus is on implementing the core features defined in the project scope.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.