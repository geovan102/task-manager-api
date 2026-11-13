# ---------- Stage 1: build ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Prisma needs OpenSSL.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Install packages first. This layer is reused (cached) until the package files change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source code.
COPY . .

# Generate the Prisma client. The URL is a FAKE one, only needed so the config can load.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

# Compile TypeScript into dist/.
RUN npm run build

# ---------- Stage 2: run ----------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Take only what is needed to run from the build stage.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=node:node /app/package.json ./package.json

# Do not run as root.
USER node

EXPOSE 3000

# Apply pending database migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
