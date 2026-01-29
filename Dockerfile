# ==========================================
# Stage 1: Base
# ==========================================
# Use specific version matching .nvmrc standard
FROM node:22-alpine AS base

# Install libc6-compat for potential native dependency compatibility
# (Commonly needed for image processing libs like sharp)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================
# Stage 2: Dependencies & Build
# ==========================================
FROM base AS builder

# Copy package management files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for build)
RUN npm ci

# Copy the rest of the application code
# Ordered by least frequency of change to maximize cache hits
COPY . .

# Build the Astro application (outputs to ./dist)
RUN npm run build

# Prune dev dependencies to keep the final image clean
# This removes packages like 'vitest', 'eslint', etc.
RUN npm prune --production

# ==========================================
# Stage 3: Runner
# ==========================================
FROM base AS runner

# Create a non-root user and group for security
# (node image already has a 'node' user, but explicit setting is good practice)
USER node

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

# Copy necessary files from the builder stage
# We only need the compiled 'dist' folder and production 'node_modules'
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Expose the application port
EXPOSE 8080

# Healthcheck to Ensure Container is Responsive
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start the application using Astro's Node adapter entry point
CMD ["node", "./dist/server/entry.mjs"]
