# ---------- Build Stage ----------
FROM node:20 AS builder

WORKDIR /app

# Optional: install turbo if needed for pruning/build orchestration
RUN npm install -g turbo

# Copy entire repo and prune if needed
COPY . .
RUN turbo prune zero --docker


# ---------- Final Stage ----------
FROM node:20 AS runner

WORKDIR /app

COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/bun.lock ./bun.lock

RUN npm install -g bun
RUN bun install --frozen-lockfile

WORKDIR /app/apps/zero

EXPOSE 4848
CMD ["bun", "start"]
