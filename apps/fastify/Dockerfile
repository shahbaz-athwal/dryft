# ---------- Build Stage ----------
FROM node:20 AS builder

WORKDIR /app

# Optional: install turbo if needed for pruning/build orchestration
RUN npm install -g turbo

# Copy entire repo and prune if needed
COPY . .
RUN turbo prune fastify --docker

# ---------- Final Stage ----------
FROM node:20 AS runner

WORKDIR /app

# Copy only needed files from builder stage
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/bun.lock ./bun.lock

RUN npm install -g bun
RUN bun install --frozen-lockfile

# Generate Prisma or DB files if needed
RUN bun run turbo db:generate

# Create a non-root user
RUN addgroup --system --gid 1001 fastify \
    && adduser --system --uid 1001 fastify

USER fastify

# Expose the port your app listens on
EXPOSE 4050

# Run the app directly with bun instead of using a compiled binary
CMD ["bun", "run", "apps/fastify/src/server.ts"]
