# Task Manager API

[![CI](https://github.com/geovan102/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/geovan102/task-manager-api/actions/workflows/ci.yml)

A Trello-like REST API for managing users, projects and tasks, built with NestJS.

## About

Task Manager API is a backend application that provides user authentication, project management, task organization and role-based access control. It demonstrates backend development concepts such as database management, caching, rate limiting, background job processing and automated testing.

## Features

- User registration and login with JWT authentication.
- Password hashing using bcryptjs.
- Projects with members and roles (`OWNER`).
- Tasks with status filtering and pagination.
- Access control for project members and owners.
- Redis caching for read operations (60-second TTL).
- Login rate limiting (5 attempts per minute per IP).
- Background jobs using BullMQ with retries.
- Input validation using class-validator.
- Database indexes for faster queries.

## Tech Stack

- TypeScript
- NestJS
- PostgreSQL
- Prisma
- JWT
- bcryptjs
- Redis
- BullMQ
- class-validator
- Swagger / OpenAPI
- Jest
- Supertest
- Docker
- Docker Compose

## Database Model

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    USER ||--o{ PROJECT_MEMBER : "joins as"
    PROJECT ||--o{ PROJECT_MEMBER : has
    PROJECT ||--o{ TASK : contains
    USER |o--o{ TASK : "is assigned"

    USER {
        int id PK
        string email UK
        string name
        string password "bcrypt hash"
        datetime createdAt
    }
    PROJECT {
        int id PK
        string name
        string description "optional"
        datetime createdAt
        int ownerId FK
    }
    PROJECT_MEMBER {
        int id PK
        string role "OWNER or MEMBER"
        int userId FK
        int projectId FK
    }
    TASK {
        int id PK
        string title
        string description "optional"
        string status "TODO, IN_PROGRESS or DONE"
        datetime createdAt
        datetime updatedAt
        int projectId FK
        int assigneeId FK "optional"
    }
```

- `PROJECT_MEMBER` connects users and projects (many-to-many) and stores the role.
- The project creator is also a member with the `OWNER` role.
- Deleting a project deletes its members and tasks (cascade).

## API Documentation

Swagger UI is available at:

**http://localhost:3000/docs**

Log in using `POST /auth/login`, then click **Authorize** in Swagger and paste your JWT token to access protected endpoints.

## Screenshots

![Swagger overview](docs/swagger-overview.png)
![Example request](docs/swagger-request.png)

## Getting Started

### Requirements

- Node.js 24
- Docker Desktop

### Run with Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/geovan102/task-manager-api.git
   cd task-manager-api
   ```

2. Navigate to the project directory.

3. Copy the example environment file:

   **Windows:**

   ```bash
   copy .env.example .env
   ```

   **macOS / Linux:**

   ```bash
   cp .env.example .env
   ```

4. Set your environment variables in `.env`. Use a strong random value for `JWT_SECRET`.

5. Start the application:

   ```bash
   docker compose up --build
   ```

   Database migrations are applied automatically when the API container starts.

6. Open the API documentation:

   **http://localhost:3000/docs**

### Local Development

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

Install dependencies:

```bash
npm install
```

Generate the Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start the development server:

```bash
npm run start:dev
```

The local services use the following ports:

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

## Project Structure

```text
task-manager-api/
├── .github/workflows/   GitHub Actions CI (lint, build, tests)
├── docs/                Screenshots used in this README
├── prisma/
│   ├── schema.prisma    Database models
│   └── migrations/      SQL migrations
├── scripts/             Helper scripts (authorization checks)
├── src/
│   ├── auth/            Authentication, JWT guard and rate limiting
│   ├── users/           User registration
│   ├── projects/        Projects, members and invitation jobs
│   ├── tasks/           Tasks, filtering and pagination
│   ├── redis/           Redis connection and caching
│   └── prisma/          Prisma service
├── Dockerfile           Production image of the API
├── docker-compose.yml   PostgreSQL, Redis and the API
└── requests.http        Manual request collection for testing
```

## Tests

Run the test suite:

```bash
npm test
```

Tests use mocks for the database and Redis, so external services are not required.

## Known Limitations

- Tests use mocks, so they do not verify SQL queries against a real database. There are no end-to-end tests yet.
- Swagger is open in every environment, and Docker Compose uses development credentials. It is not a production setup.
- Behind a reverse proxy, extra proxy settings are needed for the login rate limit to see the real client IP.

## Future Improvements

- End-to-end tests with a real PostgreSQL database.
- Real invitation emails (the queue worker currently only simulates sending).
- Secure or disable Swagger in production.

## Author

**Georgios Vanasas**
