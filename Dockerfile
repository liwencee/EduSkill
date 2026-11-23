# syntax=docker/dockerfile:1.7
# =============================================================
# Skillora API — multi-stage, distroless, non-root
#   Stage 1 (lint)       : ESLint — the build fails on errors
#   Stage 2 (deps)       : production-only node_modules
#   Stage 3 (production) : distroless Node 22 — no shell, no package
#                          manager, runs as the unprivileged "nonroot" user
#
# Build stages use Debian (glibc) to match the distroless runtime, so any
# native add-on compiled here would also load there.
# =============================================================
ARG NODE_IMAGE=node:22-bookworm-slim
ARG RUNTIME_IMAGE=gcr.io/distroless/nodejs22-debian12:nonroot

# ---- Stage 1: Lint ----
FROM ${NODE_IMAGE} AS lint
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY src/ ./src/
COPY tests/ ./tests/
COPY .eslintrc.js ./
RUN npm run lint && touch /lint-passed

# ---- Stage 2: Production dependencies ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
# BuildKit skips stages the final image doesn't use, so make the lint gate
# a real dependency of the build (otherwise linting would silently not run).
COPY --from=lint /lint-passed /lint-passed

# ---- Stage 3: Production (distroless) ----
FROM ${RUNTIME_IMAGE} AS production

LABEL org.opencontainers.image.title="Skillora API" \
      org.opencontainers.image.description="Skillora API (distroless, non-root)" \
      org.opencontainers.image.vendor="Skillora" \
      org.opencontainers.image.source="https://github.com/liwencee/EduSkill"

ENV NODE_ENV=production
WORKDIR /app

# Files stay owned by root and read-only to the app user: the process can
# read its code but never modify it.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/

# uid/gid 65532 ("nonroot" in distroless) — never root
USER 65532:65532

EXPOSE 3000

# No shell or wget in distroless — probe with Node itself. Uses $PORT when the
# platform injects one (Railway), else 3000.
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# The distroless entrypoint is already the node binary
CMD ["src/server.js"]
