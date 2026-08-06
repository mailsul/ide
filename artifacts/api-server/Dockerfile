FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files for pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy lib packages
COPY lib/db ./lib/db
COPY lib/api-zod ./lib/api-zod
COPY lib/api-spec ./lib/api-spec

# Copy backend source
COPY artifacts/api-server ./artifacts/api-server

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build libs first (composite packages)
RUN pnpm run typecheck:libs

# Build the backend bundle
RUN pnpm --filter @workspace/api-server run build

# --- Production image ---
FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Copy drizzle config and schema for migrations
COPY --from=builder /app/lib/db ./lib/db

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.cjs"]
