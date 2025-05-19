# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install (locks for reproducibility)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy TypeScript and config files
COPY tsconfig.json ./
COPY src ./src

# Build the bot (outputs JS to ./dist)
RUN npx tsc

# --- Stage 2: Production ---
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy the compiled code from builder
COPY --from=builder /app/dist ./dist

# Entrypoint: run your bot!
CMD ["node", "dist/index.js"]

# --- Stage 3: Dev (Optional) ---
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

CMD ["npx", "ts-node-dev", "src/index.ts"]
