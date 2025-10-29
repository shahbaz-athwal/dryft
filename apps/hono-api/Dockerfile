# ---------- Build Stage ----------
FROM oven/bun:1.3.0-alpine AS base
WORKDIR /app

RUN bun install -g turbo
COPY . .
RUN turbo prune hono-api --docker

# ---------- Install Dependencies ----------
FROM base AS installer

WORKDIR /app

COPY --from=base /app/out/json/ .
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/bun.lock ./bun.lock
RUN bun install --filter hono-api --frozen-lockfile
COPY --from=base /app/out/full/ .
RUN bun run turbo db:generate
RUN bun install --filter hono-api --production --frozen-lockfile

# ---------- Final Stage ----------
FROM oven/bun:1.3.0-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 hono-api
RUN adduser --system --uid 1001 hono-api
USER hono-api
COPY --from=installer /app .

EXPOSE 4000

CMD ["bun", "run", "apps/hono-api/src/server.ts"]
