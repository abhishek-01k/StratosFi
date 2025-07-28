# Multi-stage build for 1inch Fusion+ TEE Solver
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S solver && \
    adduser -S solver -u 1001

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder --chown=solver:solver /app/node_modules ./node_modules
COPY --from=builder --chown=solver:solver /app/dist ./dist
COPY --chown=solver:solver package*.json ./
COPY --chown=solver:solver env ./env

# Switch to non-root user
USER solver

# Expose metrics port
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:9090/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Use tini to handle signals properly
ENTRYPOINT ["tini", "--"]

# Start the solver
CMD ["node", "dist/main.js"]