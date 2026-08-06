FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy lib packages
COPY lib/db ./lib/db
COPY lib/api-zod ./lib/api-zod
COPY lib/api-spec ./lib/api-spec

# Copy backend source
COPY artifacts/api-server ./artifacts/api-server

# Install semua dependencies
RUN pnpm install --frozen-lockfile

# Build backend bundle langsung (skip typecheck — tidak perlu di Docker)
RUN pnpm --filter @workspace/api-server run build

# --- Production image (lebih kecil) ---
FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests untuk production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install production deps saja
RUN pnpm install --frozen-lockfile --prod

# Copy hasil build
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Copy lib/db untuk drizzle migrations
COPY --from=builder /app/lib/db ./lib/db

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]
