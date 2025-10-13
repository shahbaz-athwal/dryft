## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `next`: a nextjs frontend
- `fastify`: a fastify/trpc api
- `@repo/db`: prisma client for PostgreSQL
- `@repo/ui`: a custom shadcn component library
- `@repo/scraper`: custom scrapers for acadia course catalog and rate my professor

### Docker

This contains following docker compose files:

- `docker-compose.yml`: production docker compose file
- `docker-compose.local.yml`: local docker compose file for development

## Setup

### Prerequisites

- Docker
- Bun
- Biome (for linting and formatting)
- PostgreSQL with WAL replication enabled
