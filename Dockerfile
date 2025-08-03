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
FROM node:20-slim AS prod
WORKDIR /app

# Install runtime dependencies for canvas
RUN apt-get update && apt-get install -y \
  python3 \
  libcairo2 \
  libpango-1.0-0 \
  libjpeg62-turbo \
  libgif7 \
  librsvg2-2 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
