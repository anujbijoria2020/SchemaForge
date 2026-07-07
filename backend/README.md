# SchemaForge Backend API

A robust, enterprise-ready product studio backend for **SchemaForge** — a collaborative database schema design and modeling tool. Built with Node.js, Express, TypeScript, and Prisma, this service manages collaborative workspaces, database modeling, schema snapshot versioning, access control, and user authentication.

---

## 🚀 Tech Stack

*   **Runtime Environment**: Node.js (v20+)
*   **Language**: TypeScript
*   **Web Framework**: Express.js
*   **Database ORM**: Prisma (PostgreSQL adapter)
*   **Primary Database**: PostgreSQL
*   **Caching & Blacklisting**: Redis
*   **Authentication & Security**: JSON Web Tokens (JWT), HTTP-Only Cookies, Helmet, and Bcrypt
*   **Data Validation**: Zod

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v20 or higher)
*   [npm](https://www.npmjs.com/) (v10 or higher)
*   [Docker & Docker Compose](https://www.docker.com/) (for running database services)

---

## 🛠️ Environment Setup (Step-by-Step)

Follow these steps to configure your environment variables:

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create your environment configuration file**:
    Copy the sample configuration file to create your active environment file:
    ```bash
    cp .env.example .env
    ```

3.  **Configure environment variables**:
    Open the newly created `.env` file and configure the settings. Minimum required environment variables:
    ```env
    # Server Configuration
    PORT=4000
    NODE_ENV=development

    # Database & Redis Connections
    DATABASE_URL=postgresql://postgres:postgres_secure_password@localhost:5432/schemaforge?schema=public
    REDIS_URL=redis://localhost:6379

    # Security Secrets (Must be at least 32 characters)
    JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
    JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_at_least_32_characters_long
    BCRYPT_ROUNDS=12

    # Client Application URL
    FRONTEND_URL=http://localhost:3000
    ```

---

## 🐳 Docker Commands (Database Infrastructure)

SchemaForge utilizes Docker Compose to orchestrate database infrastructure services (PostgreSQL and Redis) locally.

*   **Start Infrastructure Services**:
    Run Postgres and Redis in the background:
    ```bash
    docker compose up -d
    ```

*   **Stop Infrastructure Services**:
    Stop the running containers without deleting data:
    ```bash
    docker compose down
    ```

*   **Stop and Wipe Database Volumes**:
    Stop the services and wipe out database volumes (useful for starting with a fresh slate):
    ```bash
    docker compose down -v
    ```

*   **Check Services Status**:
    Verify that the containers are healthy:
    ```bash
    docker compose ps
    ```

---

## 🔄 Running Migrations & Seeding

After the database services are up and running, you need to apply the schema migrations and optionally seed the database.

1.  **Install dependencies**:
    Ensure the dependencies and type definitions are installed:
    ```bash
    npm install
    ```

2.  **Generate Prisma Client**:
    Generate the local Prisma Client types based on your schema:
    ```bash
    npx prisma generate
    ```

3.  **Run Database Migrations**:
    Apply current migrations to your database:
    ```bash
    npx prisma migrate dev
    ```

4.  **Seed the Database**:
    Seed the database with sample/initial development data (e.g., test users, workspaces):
    ```bash
    npx prisma db seed
    ```

---

## 🏃 Running the Application Locally

*   **Development Mode (Hot Reloading)**:
    Starts the dev server with `nodemon` and `ts-node` for automatic code reloading:
    ```bash
    npm run dev
    ```

*   **Production Build & Run**:
    Compiles TypeScript to Javascript in `dist/` and runs the production server:
    ```bash
    npm run build
    npm run start
    ```

*   **TypeScript Verification**:
    Runs type verification across the source directory without emitting files:
    ```bash
    npm run type-check
    ```

---

## 🔑 Authentication Flow Explanation

SchemaForge uses a dual-token JWT rotation scheme to ensure secure and seamless session management:

1.  **Tokens Issued**:
    *   **Access Token**: Short-lived JWT (15 minutes) sent in the response body payload. Used to authenticate subsequent API queries in the `Authorization: Bearer <token>` header.
    *   **Refresh Token**: Long-lived JWT (7 days) sent automatically in an `httpOnly`, `secure`, `sameSite: lax` cookie named `refreshToken`.

2.  **Authorization Middleware**:
    *   [requireAuth](file:///c:/web/dev/projects/SchemaForge/backend/src/middlewares/auth.middleware.ts) extracts the bearer token from the authorization header, verifies it using `JWT_SECRET`, and populates `req.user` with user metadata.
    *   If the access token expires, the client calls the `/api/auth/refresh` endpoint.

3.  **Blacklist Rotation & Security**:
    *   When the client calls `/api/auth/refresh`, the server verifies the `refreshToken` and checks it against a Redis blacklist.
    *   If valid, the old refresh token is blacklisted in Redis for its remaining TTL, and a new set of Access and Refresh tokens is generated.
    *   Logging out (`/api/auth/logout`) clears the refresh token cookie automatically.

---

## 🛣️ API Endpoints

All endpoints (except health and public auth endpoints) require authentication via `Authorization: Bearer <Access_Token>`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registers a new user account | No |
| `POST` | `/api/auth/login` | Authenticates credentials and starts session | No |
| `POST` | `/api/auth/refresh` | Issues a new Access Token & rotates Refresh Token | No (Cookie-based) |
| `POST` | `/api/auth/logout` | Clears refresh token cookie and ends session | Yes |
| `GET` | `/api/auth/me` | Retrieves the currently authenticated user's profile | Yes |

### 🏢 Workspace Management (`/api/workspaces`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/workspaces` | Creates a new workspace | Owner |
| `GET` | `/api/workspaces` | Lists all workspaces the authenticated user belongs to | Viewer |
| `GET` | `/api/workspaces/:id` | Retrieves detailed information of a specific workspace | Viewer |
| `PATCH` | `/api/workspaces/:id` | Updates workspace metadata (name, description, avatar) | Admin |
| `DELETE` | `/api/workspaces/:id` | Deletes a workspace permanently | Owner |
| `GET` | `/api/workspaces/:workspaceId/members` | Lists all members of a workspace | Viewer |
| `POST` | `/api/workspaces/:workspaceId/members` | Manually adds a user to a workspace | Admin |
| `PATCH` | `/api/workspaces/:workspaceId/members/:userId` | Updates workspace role of a member | Admin |
| `DELETE` | `/api/workspaces/:workspaceId/members/:userId` | Removes a member from a workspace | Admin |

### ✉️ Workspace Invitations
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `GET` | `/api/workspaces/:workspaceId/invitations` | Lists all workspace invitations | Admin |
| `POST` | `/api/workspaces/:workspaceId/invitations` | Invites a user via email | Admin |
| `DELETE` | `/api/workspaces/:workspaceId/invitations/:invitationId` | Revokes a pending workspace invitation | Admin |
| `GET` | `/api/workspaces/invitations/:token` | Retrieves invitation details by token | No |
| `POST` | `/api/workspaces/invitations/accept` | Accepts an invitation and joins workspace | Yes |
| `POST` | `/api/workspaces/invitations/reject` | Rejects a workspace invitation | Yes |

### 📁 Project Management (`/api`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/workspaces/:workspaceId/projects` | Creates a new project in the workspace | Editor |
| `GET` | `/api/workspaces/:workspaceId/projects` | Lists all projects in a workspace | Viewer |
| `GET` | `/api/projects/:id` | Retrieves a specific project and schema | Viewer |
| `PATCH` | `/api/projects/:id` | Updates project details (name, description) | Editor |
| `DELETE` | `/api/projects/:id` | Deletes a project | Admin |
| `POST` | `/api/projects/:id/archive` | Archives a project | Editor |
| `POST` | `/api/projects/:id/schema` | Saves the database schema canvas state | Editor |

### 🕒 Schema Versioning (`/api/projects`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/projects/:id/versions` | Manually creates a schema snapshot version | Editor |
| `GET` | `/api/projects/:id/versions` | Lists all version snapshots for a project | Viewer |
| `GET` | `/api/projects/:id/versions/:versionId` | Retrieves a specific schema version snapshot | Viewer |
