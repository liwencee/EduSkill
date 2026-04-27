# ---- Build stage ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ---- Production stage ----
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S skillbridge -u 1001 -G nodejs

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder --chown=skillbridge:nodejs /app/node_modules ./node_modules

# Copy source
COPY --chown=skillbridge:nodejs src/ ./src/
COPY --chown=skillbridge:nodejs package*.json ./

# Drop privileges
USER skillbridge

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
