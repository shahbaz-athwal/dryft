# ---------- Build Stage ----------
FROM node:20 AS builder

WORKDIR /app

# Install bun and turbo
RUN npm install -g bun turbo

COPY . .
RUN turbo prune fastify --docker

# ---------- Install Dependencies ----------
FROM node:20 AS installer

WORKDIR /app

# Install bun and turbo
RUN npm install -g bun turbo

# Copy pruned output
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/bun.lock ./bun.lock

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY --from=builder /app/out/full/ .

# Generate database
RUN bun run turbo db:generate

# ---------- Final Stage ----------
FROM oven/bun:alpine AS runner

WORKDIR /app

# Copy everything from installer stage
COPY --from=installer /app .

RUN addgroup -S fastify && adduser -S -G fastify fastify

USER fastify

EXPOSE 4050

CMD ["bun", "run", "apps/fastify/src/server.ts"]
