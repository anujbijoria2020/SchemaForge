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

## Database (Day 2 Complete)
Prisma 5 + PostgreSQL 16
13 models migrated: User, Workspace, WorkspaceMember, WorkspaceInvitation,
  Project, Schema, SchemaTable, SchemaColumn, Version,
  Comment, ActivityLog, AiGeneration, Notification
 
Key decisions:
- canvas_state: JSONB on Schema (fast R/W) + normalised SchemaTable/Column (for diff engine)
- ActivityLog onDelete: SetNull (keep logs when project/workspace deleted)
- All IDs: String @default(uuid()) — no auto-increment integers
- All tables: @@map('snake_case') — table names are snake_case in PostgreSQL
 
Migration: prisma/migrations/TIMESTAMP_init/migration.sql
Seed: npx prisma db seed (creates 2 users, 2 workspaces, 3 projects)
Studio: npx prisma studio (http://localhost:5555)
 
## Authentication & Middleware (Day 3 Complete)
JWT authentication implemented: register, login, refresh, logout, /me endpoint.
Created files:
- [auth.dto.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/modules/auth/auth.dto.ts) (Zod schemas for registration and login validation)
- [auth.repository.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/modules/auth/auth.repository.ts) (Database queries with Prisma Client)
- [auth.service.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/modules/auth/auth.service.ts) (Business logic, password hashing, and token generation)
- [auth.controller.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/modules/auth/auth.controller.ts) (Request handling and token cookie management)
- [auth.routes.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/modules/auth/auth.routes.ts) (Express router mapping)
- [auth.middleware.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/middlewares/auth.middleware.ts) (JWT authentication helper)
- [errorHandler.middleware.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/middlewares/errorHandler.middleware.ts) (Global structured error formatter)
- [rateLimiter.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/middlewares/rateLimiter.ts) (Redis/memory rate limiting)
- [authorize.ts](file:///c:/web%20dev/projects/SchemaForge/backend/src/middlewares/authorize.ts) (Role-based access middleware)

---

## Backend API Reference (for Frontend Integration)

All API endpoints are prefixed with `/api`. Authentication relies on JSON Web Tokens (JWT). 
- An **Access Token** is returned on successful login/registration in the response body. This token must be included in the HTTP headers: `Authorization: Bearer <accessToken>`.
- A **Refresh Token** is stored in a secure, HTTP-only cookie (`refreshToken`) and automatically handled by the browser.

### 1. Global Response Envelopes

All success responses (except `204 No Content`) follow the `SuccessBody` structure:
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

All error responses return the `ErrorBody` structure:
```json
{
  "success": false,
  "message": "Error description message",
  "errors": [],
  "stack": "Stack trace (Only in development environment)"
}
```

---

### 2. Authentication Endpoints (`/api/auth`)

#### Register User
*   **Method / Route**: `POST /api/auth/register`
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123",
      "displayName": "Jane Doe"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "u-uuid-1234",
          "email": "user@example.com",
          "displayName": "Jane Doe"
        },
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```

#### Login
*   **Method / Route**: `POST /api/auth/login`
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "u-uuid-1234",
          "email": "user@example.com",
          "displayName": "Jane Doe"
        },
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```

#### Refresh Token
*   **Method / Route**: `POST /api/auth/refresh`
*   **Request Body**: `{}` (Checks secure `refreshToken` cookie)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "new-eyJhbGciOi..."
      }
    }
    ```

#### Logout
*   **Method / Route**: `POST /api/auth/logout`
*   **Request Body**: None
*   **Response (204 No Content)**: Returns status code `204` with no body. Clears the `refreshToken` cookie.

#### Get Current User (`/me`)
*   **Method / Route**: `GET /api/auth/me`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "u-uuid-1234",
          "email": "user@example.com",
          "displayName": "Jane Doe"
        }
      }
    }
    ```

---

### 3. Workspace Endpoints (`/api/workspaces`)
All workspace routes require authorization. Workspace members can have roles: `'owner'`, `'admin'`, `'editor'`, `'viewer'`, or `'commenter'`.

#### Create Workspace
*   **Method / Route**: `POST /api/workspaces`
*   **Request Body**:
    ```json
    {
      "name": "Acme Org",
      "slug": "acme-org",
      "description": "Optional organization description"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "workspace": {
          "id": "w-uuid-1234",
          "name": "Acme Org",
          "slug": "acme-org",
          "description": "Optional organization description",
          "ownerId": "u-uuid-1234",
          "createdAt": "2026-07-07T12:00:00.000Z"
        }
      }
    }
    ```

#### Get My Workspaces
*   **Method / Route**: `GET /api/workspaces`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "workspaces": [
          {
            "id": "w-uuid-1234",
            "name": "Acme Org",
            "slug": "acme-org",
            "role": "owner"
          }
        ]
      }
    }
    ```

#### Get Workspace by ID
*   **Method / Route**: `GET /api/workspaces/:id`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "workspace": {
          "id": "w-uuid-1234",
          "name": "Acme Org",
          "slug": "acme-org",
          "description": "Optional organization description",
          "createdAt": "2026-07-07T12:00:00.000Z"
        }
      }
    }
    ```

#### Update Workspace
*   **Method / Route**: `PATCH /api/workspaces/:id`
*   **Request Body (Partial)**:
    ```json
    {
      "name": "Acme Updated",
      "description": "New description"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "workspace": {
          "id": "w-uuid-1234",
          "name": "Acme Updated",
          "slug": "acme-org",
          "description": "New description"
        }
      }
    }
    ```

#### Delete Workspace
*   **Method / Route**: `DELETE /api/workspaces/:id`
*   **Response (204 No Content)**

#### List Workspace Members
*   **Method / Route**: `GET /api/workspaces/:workspaceId/members`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "members": [
          {
            "userId": "u-uuid-1234",
            "role": "owner",
            "user": {
              "displayName": "Jane Doe",
              "email": "user@example.com"
            }
          }
        ]
      }
    }
    ```

#### Add Workspace Member Directly
*   **Method / Route**: `POST /api/workspaces/:workspaceId/members`
*   **Request Body**:
    ```json
    {
      "userId": "another-user-uuid",
      "role": "editor"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "member": {
          "workspaceId": "w-uuid-1234",
          "userId": "another-user-uuid",
          "role": "editor"
        }
      }
    }
    ```

#### Update Member Role
*   **Method / Route**: `PATCH /api/workspaces/:workspaceId/members/:userId`
*   **Request Body**:
    ```json
    {
      "role": "admin"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "member": {
          "workspaceId": "w-uuid-1234",
          "userId": "another-user-uuid",
          "role": "admin"
        }
      }
    }
    ```

#### Remove Workspace Member
*   **Method / Route**: `DELETE /api/workspaces/:workspaceId/members/:userId`
*   **Response (204 No Content)**

#### Invite User (Sends Workspace Invitation)
*   **Method / Route**: `POST /api/workspaces/:workspaceId/invitations`
*   **Request Body**:
    ```json
    {
      "email": "invitee@example.com",
      "role": "editor"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "invitation": {
          "id": "i-uuid-1234",
          "email": "invitee@example.com",
          "role": "editor",
          "token": "secret-invite-token",
          "status": "pending",
          "workspaceId": "w-uuid-1234"
        }
      }
    }
    ```

#### List Workspace Invitations
*   **Method / Route**: `GET /api/workspaces/:workspaceId/invitations`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "invitations": [
          {
            "id": "i-uuid-1234",
            "email": "invitee@example.com",
            "role": "editor",
            "status": "pending"
          }
        ]
      }
    }
    ```

#### Revoke Invitation
*   **Method / Route**: `DELETE /api/workspaces/:workspaceId/invitations/:invitationId`
*   **Response (204 No Content)**

#### Get Invitation Details by Token
*   **Method / Route**: `GET /api/workspaces/invitations/:token`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "invitation": {
          "id": "i-uuid-1234",
          "email": "invitee@example.com",
          "role": "editor",
          "workspaceName": "Acme Org"
        }
      }
    }
    ```

#### Accept Invitation
*   **Method / Route**: `POST /api/workspaces/invitations/accept`
*   **Request Body**:
    ```json
    {
      "token": "secret-invite-token"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "member": {
          "workspaceId": "w-uuid-1234",
          "role": "editor"
        }
      }
    }
    ```

#### Reject Invitation
*   **Method / Route**: `POST /api/workspaces/invitations/reject`
*   **Request Body**:
    ```json
    {
      "token": "secret-invite-token"
    }
    ```
*   **Response (204 No Content)**

---

### 4. Project Endpoints (`/api`)

#### Create Project
*   **Method / Route**: `POST /api/workspaces/:workspaceId/projects`
*   **Request Body**:
    ```json
    {
      "name": "E-Commerce Database Schema",
      "description": "Tables for orders, products, and users",
      "dialect": "postgresql",
      "isPublic": false
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "project": {
          "id": "p-uuid-1234",
          "name": "E-Commerce Database Schema",
          "description": "Tables for orders, products, and users",
          "dialect": "postgresql",
          "isPublic": false,
          "isArchived": false,
          "workspaceId": "w-uuid-1234"
        }
      }
    }
    ```

#### List Projects
*   **Method / Route**: `GET /api/workspaces/:workspaceId/projects`
*   **Query Params**: `?includeArchived=true` (Default is false)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "projects": [
          {
            "id": "p-uuid-1234",
            "name": "E-Commerce Database Schema",
            "isArchived": false
          }
        ]
      }
    }
    ```

#### Get Project by ID
*   **Method / Route**: `GET /api/projects/:id`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "project": {
          "id": "p-uuid-1234",
          "name": "E-Commerce Database Schema",
          "description": "Tables for orders, products, and users",
          "dialect": "postgresql",
          "isPublic": false,
          "isArchived": false,
          "schema": {
            "id": "s-uuid-1234",
            "canvasState": {},
            "tables": []
          }
        }
      }
    }
    ```

#### Update Project
*   **Method / Route**: `PATCH /api/projects/:id`
*   **Request Body (Partial)**:
    ```json
    {
      "name": "Updated Project Name",
      "isPublic": true
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "project": {
          "id": "p-uuid-1234",
          "name": "Updated Project Name"
        }
      }
    }
    ```

#### Delete Project
*   **Method / Route**: `DELETE /api/projects/:id`
*   **Response (204 No Content)**

#### Archive Project
*   **Method / Route**: `POST /api/projects/:id/archive`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "project": {
          "id": "p-uuid-1234",
          "isArchived": true
        }
      }
    }
    ```

#### Save Project Schema (Visual Canvas & Tables)
*   **Method / Route**: `POST /api/projects/:id/schema`
*   **Request Body**:
    ```json
    {
      "canvasState": {
        "zoom": 1.2,
        "pan": { "x": 100, "y": 200 }
      },
      "tables": [
        {
          "name": "users",
          "color": "#2563EB",
          "positionX": 150,
          "positionY": 250,
          "columns": [
            {
              "name": "id",
              "dataType": "UUID",
              "isNullable": false,
              "isPrimaryKey": true,
              "isUnique": true,
              "defaultValue": "gen_random_uuid()",
              "checkExpr": null,
              "sortOrder": 0
            },
            {
              "name": "email",
              "dataType": "VARCHAR(255)",
              "isNullable": false,
              "isPrimaryKey": false,
              "isUnique": true,
              "defaultValue": null,
              "checkExpr": null,
              "sortOrder": 1
            }
          ]
        }
      ]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "schema": {
          "id": "s-uuid-1234",
          "projectId": "p-uuid-1234",
          "canvasState": { "zoom": 1.2, "pan": { "x": 100, "y": 200 } },
          "tables": [ ... ]
        }
      }
    }
    ```

---

### 5. Version Snapshots Endpoints (`/api/projects/:id/versions`)

#### Create Snapshot Version
*   **Method / Route**: `POST /api/projects/:id/versions`
*   **Request Body**:
    ```json
    {
      "label": "v1.0.0-Beta",
      "description": "Initial design of database schema"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "version": {
          "id": "v-uuid-1234",
          "label": "v1.0.0-Beta",
          "description": "Initial design of database schema",
          "isAuto": false,
          "createdAt": "2026-07-07T12:00:00.000Z",
          "projectId": "p-uuid-1234",
          "schemaSnapshot": {
            "canvasState": { ... },
            "tables": [ ... ]
          }
        }
      }
    }
    ```

#### List Project Versions
*   **Method / Route**: `GET /api/projects/:id/versions`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "versions": [
          {
            "id": "v-uuid-1234",
            "label": "v1.0.0-Beta",
            "description": "Initial design of database schema",
            "createdAt": "2026-07-07T12:00:00.000Z"
          }
        ]
      }
    }
    ```

#### Get Specific Version Details
*   **Method / Route**: `GET /api/projects/:id/versions/:versionId`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "version": {
          "id": "v-uuid-1234",
          "label": "v1.0.0-Beta",
          "description": "Initial design of database schema",
          "isAuto": false,
          "createdAt": "2026-07-07T12:00:00.000Z",
          "schemaSnapshot": {
            "canvasState": { ... },
            "tables": [ ... ]
          }
        }
      }
    }
    ```
