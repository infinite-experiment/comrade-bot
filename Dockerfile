# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies for node-canvas
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  pixman-dev \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  librsvg-dev \
  build-base

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

# Install full dependencies including dev
COPY package.json package-lock.json* ./
RUN npm ci

# Transpile TypeScript → JavaScript
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS prod
WORKDIR /app

# Install runtime dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy compiled JS output from builder
COPY --from=builder /app/dist ./dist

# Run bot
CMD ["node", "dist/index.js"]
