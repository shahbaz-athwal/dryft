# ---------- Build Stage ----------
FROM node:20 AS builder

WORKDIR /app

RUN npm install -g bun turbo

COPY . .
RUN turbo prune hono-api --docker

# ---------- Install Dependencies ----------
FROM node:20 AS installer

WORKDIR /app

RUN npm install -g bun

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/bun.lock ./bun.lock

RUN bun install --frozen-lockfile

COPY --from=builder /app/out/full/ .

RUN bun run turbo db:generate

# ---------- Final Stage ----------
FROM oven/bun:alpine AS runner

WORKDIR /app

COPY --from=installer /app .

RUN addgroup -S hono && adduser -S -G hono hono

USER hono

EXPOSE 4000

CMD ["bun", "run", "apps/hono-api/src/server.ts"]
