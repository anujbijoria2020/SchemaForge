# SchemaForge Context

SchemaForge is a SaaS application designed for visual schema design, validation, and generation.
This document details the project's Day 1 completed architecture and Day 2 planning context.

## Tech Stack
- **Monorepo**: npm Workspaces
- **Backend**: Node.js 20, TypeScript 5, Express 4, Zod
- **Infrastructure**: Docker Compose (PostgreSQL 16, Redis 7)
- **Security**: CORS (strict origin + credentials), Helmet, secure JWT

## Directory Structure
```
schemaforge/
├── backend/            # Express API service
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

## Key Decisions
- **Monorepo Structure**: Isolated workspaces allowing easy future frontend/backend integration.
- **Fail-Fast Environment Validation**: Zod parses process.env at server boot, preventing runtime failures.
- **Root Docker Compose**: Running persistent, password-protected development services.

## Day 2 Plan
- Initialize Prisma ORM in `backend/`.
- Build and migrate a full 13-model PostgreSQL database schema.

## Development Commands
- Start databases: `docker compose up -d`
- Start backend: `cd backend && npm run dev`
- Run typecheck: `cd backend && npm run type-check`
- Check health: `curl -s http://localhost:4000/api/health`
