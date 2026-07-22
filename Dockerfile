# =============================================================
# Skillora — multi-stage Dockerfile
#   Stage 1 (lint)       : runs ESLint — build fails on errors
#   Stage 2 (builder)    : installs production-only deps
#   Stage 3 (production) : lean, non-root, read-only image
# =============================================================

# ---- Stage 1: Lint ----
FROM node:20-alpine AS lint

WORKDIR /app

# Install ALL deps (devDependencies include ESLint + plugins)
COPY package*.json ./
RUN npm ci

# Copy source tree for linting
COPY src/       ./src/
COPY tests/     ./tests/
COPY .eslintrc.js ./

# Lint gate — the entire build fails here if ESLint reports errors
RUN npm run lint

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ---- Stage 3: Production ----
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

LABEL org.opencontainers.image.title="Skillora" \
      org.opencontainers.image.description="Skillora API" \
      org.opencontainers.image.vendor="Skillora" \
      org.opencontainers.image.source="https://github.com/liwencee/EduSkill"

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser -S skillbridge -u 1001 -G nodejs

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder --chown=skillbridge:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=skillbridge:nodejs src/         ./src/
COPY --chown=skillbridge:nodejs package*.json ./

# Drop to non-root
USER skillbridge

EXPOSE 3000

# Use $PORT if the platform injects one (Railway, etc.) — falls back to 3000
# for local `docker run`. Hardcoding 3000 here silently breaks the healthcheck
# on any host that assigns a different port, which Railway marks unhealthy
# and stops routing to (502 Bad Gateway) even though the app is running fine.
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-3000}/api/v1/health" || exit 1

CMD ["node", "src/server.js"]
