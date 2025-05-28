# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# install all deps
COPY package.json package-lock.json* ./
RUN npm ci

# transpile TS → JS
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS prod
WORKDIR /app

# only prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# copy compiled output
COPY --from=builder /app/dist ./dist

# run your bot
CMD ["node", "dist/index.js"]
