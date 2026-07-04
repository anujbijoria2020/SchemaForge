# SchemaForge Context

SchemaForge is a SaaS application designed for visual schema design, validation, and generation.
This document details the project's Day 1 completed architecture and Day 2 planning context.

## Tech Stack
- **Monorepo**: npm Workspaces
- **Backend**: Node.js 20, TypeScript 5, Express 4, Zod
- **Database**: PostgreSQL 16 (via Prisma ORM 7.8.0)
- **Infrastructure**: Docker Compose (PostgreSQL 16, Redis 7)
- **Security**: CORS (strict origin + credentials), Helmet, secure JWT

## Directory Structure
```
schemaforge/
├── backend/            # Express API service
│   ├── prisma/         # Prisma configuration and schemas
│   │   ├── schema.prisma # 13-model database schema
│   │   └── schema.dbml # Generated DBML visualization
│   ├── src/            # TypeScript source (app.ts, index.ts, config/)
│   └── Dockerfile.dev  # Dev container configuration
├── frontend/           # Next.js/Vite app placeholder (empty)
├── packages/           # Shared libraries
│   └── types/          # Shared TS types placeholder (empty)
├── docker-compose.yml  # Local databases runner
└── CONTEXT.md          # AI context bootstrap file
```

## What's Working Today
- Docker Compose running PostgreSQL and Redis containers with health checks.
- Zero-dependency environment variable checking and validation using Zod.
- Secure HTTP/REST boilerplate on port 4000 with Helmet, CORS, and logging.
- `GET /api/health` returns status details and uptime.
- Prisma ORM configured in `backend/` with a completed 13-model visual designer schema, DBML generator, and generated client.

## Key Decisions
- **Monorepo Structure**: Isolated workspaces allowing easy future frontend/backend integration.
- **Fail-Fast Environment Validation**: Zod parses process.env at server boot, preventing runtime failures.
- **Root Docker Compose**: Running persistent, password-protected development services.
- **Prisma Client Output**: Prisma Client is generated to `backend/src/generated/prisma` to keep the workspace import paths clean.

## Day 2 Plan
- Apply fixes for identified index gaps and JSON field defaults in `schema.prisma`.
- Run database migrations (`prisma migrate dev`) to create database tables.
- Initialize routing and controller structure for the Express backend.

## Development Commands
- Start databases: `docker compose up -d`
- Start backend: `cd backend && npm run dev`
- Run typecheck: `cd backend && npm run type-check`
- Check health: `curl -s http://localhost:4000/api/health`
- Generate Prisma Client & DBML: `cd backend && npx prisma generate`
- Apply migrations: `cd backend && npx prisma migrate dev`
