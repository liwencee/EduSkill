# syntax=docker/dockerfile:1.7
# =============================================================
# Skillora web (Next.js) — multi-stage, distroless, non-root
#   Stage 1 (deps)    : install dependencies
#   Stage 2 (builder) : next build with output: 'standalone'
#   Stage 3 (runner)  : distroless Node 22 — only the standalone server,
#                       static assets and public/; no shell, no package
#                       manager, runs as the unprivileged "nonroot" user
# Build context: this web/ folder.
# =============================================================
ARG NODE_IMAGE=node:22-bookworm-slim
ARG RUNTIME_IMAGE=gcr.io/distroless/nodejs22-debian12:nonroot

# ---- Stage 1: Dependencies ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Stage 2: Build ----
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

# NEXT_PUBLIC_* values are compiled into the browser bundle (and the CSP in
# next.config.js) at build time, so they must be passed as build args.
# Railway passes service variables to declared ARGs automatically.
# These are public values by design — never put secrets in NEXT_PUBLIC_*.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
    NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME=$NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
 # an empty, writable cache dir for the runtime image optimiser (the build's
 # own .next/cache is large and not needed at runtime)
 && mkdir -p /runtime-cache/images

# ---- Stage 3: Runtime (distroless) ----
FROM ${RUNTIME_IMAGE} AS runner

LABEL org.opencontainers.image.title="Skillora Web" \
      org.opencontainers.image.description="Skillora web app (Next.js standalone, distroless, non-root)" \
      org.opencontainers.image.vendor="Skillora" \
      org.opencontainers.image.source="https://github.com/liwencee/EduSkill"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app

# Code is owned by root and read-only for the app user. Only the Next image
# cache directory is writable by "nonroot" (uid 65532).
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=65532:65532 /runtime-cache ./.next/cache

USER 65532:65532

EXPOSE 3000

# No shell or curl in distroless — probe with Node. Any HTTP answer means the
# server is up (/api/health reports database status separately).
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/',{method:'HEAD',redirect:'manual'}).then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"]

# The distroless entrypoint is already the node binary
CMD ["server.js"]
