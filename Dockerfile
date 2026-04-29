# =============================================================
# EduSkill — multi-stage Dockerfile
#   Stage 1 (lint)       : runs ESLint — build fails on errors
#   Stage 2 (builder)    : installs production-only deps
#   Stage 3 (production) : lean, non-root, read-only image
# =============================================================

# ---- Stage 1: Lint ----
FROM node:18-alpine AS lint

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
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ---- Stage 3: Production ----
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

LABEL org.opencontainers.image.title="EduSkill" \
      org.opencontainers.image.description="SkillBridge Nigeria — EduSkill API" \
      org.opencontainers.image.vendor="SkillBridge Nigeria" \
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

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
