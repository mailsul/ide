FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy lib packages needed by frontend
COPY lib/api-client-react ./lib/api-client-react
COPY lib/api-spec ./lib/api-spec

# Copy frontend source
COPY artifacts/ide-platform ./artifacts/ide-platform

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build frontend (requires BASE_PATH and VITE_API_URL at build time)
ARG BASE_PATH=/
ARG VITE_API_URL=/api
ENV BASE_PATH=$BASE_PATH
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @workspace/ide-platform run build

# --- Production: Nginx to serve static files ---
FROM nginx:alpine

COPY docker/nginx/nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/artifacts/ide-platform/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
