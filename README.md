# Task Manager API

A simple Trello-like REST API built with NestJS: users, projects, tasks and roles.
It is a learning project, built step by step with a focus on correctness, security basics and performance.

## Tech stack

- **TypeScript**, **NestJS**
- **PostgreSQL** with **Prisma** (migrations, indexes)
- **JWT** authentication, passwords hashed with bcryptjs
- **Redis** (response cache and login rate limit)
- **BullMQ** (background queue with retries)
- **class-validator** for input validation
- **Swagger / OpenAPI** documentation
- **Jest** and **Supertest** for tests
- **Docker** and Docker Compose

## Features

- Register and log in with JWT (tokens expire after 1 hour).
- Projects with members and roles. The project creator is its `OWNER`.
- Authorization rules:
  - a user who is not a member of a project gets `404` (the project is not revealed);
  - a member who is not the owner gets `403` on owner-only actions.
- Tasks inside projects, with status filtering and pagination (`page`, `limit`, max 50 per page).
- A database index on tasks: the same query went from about 5 ms to about 0.3 ms (checked with `EXPLAIN`).
- Redis cache for reads (TTL 60 s), invalidated when data changes.
- Login rate limit: 5 attempts per minute per IP.
- Background queue: adding a member enqueues an invitation job (3 attempts, exponential backoff).
- Input validation: unknown fields are stripped, invalid input returns `400`.

## API documentation

Start the app and open **http://localhost:3000/docs** (Swagger UI).
Log in with `POST /auth/login`, press **Authorize** and paste the token to try protected endpoints.

## Getting started (Docker)

Requirements: Docker Desktop.

1. Copy the example environment file and set your own values:

   ```
   copy .env.example .env      # Windows
   cp .env.example .env        # macOS / Linux
   ```

   Set `JWT_SECRET` to a long random string. Never commit `.env`.

2. Start everything (database, Redis and the API):

   ```
   docker compose up --build
   ```

   Database migrations are applied automatically when the API container starts.

3. Open http://localhost:3000/docs

## Local development (without the API container)

Requirements: Node.js 24 and Docker Desktop.

```
docker compose up -d postgres redis
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

In `.env`, the database is reached on `localhost:5433` and Redis on `localhost:6379`.

## Tests

```
npm test
```

The tests use mocks for the database and Redis, so they run without any running services.

## Project structure

```
src/
  auth/        login, JWT guard, login rate limit
  users/       user registration
  projects/    projects, members, invitation queue and worker
  tasks/       tasks with filtering and pagination
  redis/       Redis connection and cache helpers
  prisma/      Prisma service
prisma/        schema and migrations
```

## Known limitations

- Tests use mocks, so they do not prove that the real SQL queries are correct. There is no end-to-end test against a real database yet.
- The Swagger page is open in every environment. In production it should be disabled or protected.
- The Docker Compose file uses local development credentials and is not a production setup.
- Behind a reverse proxy, the rate limit needs the proxy settings (`trust proxy`) to see the real client IP.
