# =============================================================
# Skillora — multi-stage Dockerfile
#   Stage 1 (lint)             : runs ESLint — build fails on errors
#   Stage 2 (frontend-builder) : builds the Next.js frontend (/web)
#   Stage 3 (backend-builder)  : installs production-only backend deps
#   Stage 4 (production)       : lean, non-root, read-only image
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

# ---- Stage 2: Frontend builder (Next.js) ----
# Builds the Next.js frontend that lives in /web. This is a separate
# package.json/npm project from the root Express backend, so `npm run
# build` at the repo root never touches it — without this stage the
# production image ships no .next output and every page request 500s
# with "Application error: a client-side exception has occurred".
FROM node:20-alpine AS frontend-builder

WORKDIR /app/web

COPY web/package*.json ./
RUN npm ci

COPY web/ ./

# Produces /app/web/.next — the compiled build cache and runtime artifacts
# the Next.js server needs to serve pages.
RUN npm run build

# ---- Stage 3: Backend builder ----
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ---- Stage 4: Production ----
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

# Copy production node_modules from the backend builder
COPY --from=backend-builder --chown=skillbridge:nodejs /app/node_modules ./node_modules

# Copy backend application source
COPY --chown=skillbridge:nodejs src/         ./src/
COPY --chown=skillbridge:nodejs package*.json ./

# Copy the built Next.js frontend so the Express app can serve it —
# .next holds the compiled pages/runtime, web/package.json + web/node_modules
# are required by `next start`/the Next.js production server.
COPY --from=frontend-builder --chown=skillbridge:nodejs /app/web/.next          ./web/.next
COPY --from=frontend-builder --chown=skillbridge:nodejs /app/web/package*.json ./web/
COPY --from=frontend-builder --chown=skillbridge:nodejs /app/web/node_modules  ./web/node_modules
COPY --from=frontend-builder --chown=skillbridge:nodejs /app/web/public       ./web/public

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
