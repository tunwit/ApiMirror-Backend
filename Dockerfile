# syntax=docker/dockerfile:1
FROM oven/bun:1.3.2-slim
WORKDIR /app

# Build from the repository root to resolve the shared workspace package.
COPY package.json bun.lock bunfig.toml ./
COPY backend/package.json ./backend/package.json
COPY playground/package.json ./playground/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY packages/database ./packages/database
COPY backend/src ./backend/src

ENV NODE_ENV=production PORT=3001
USER bun
EXPOSE 3001
CMD ["bun", "backend/src/index.ts"]
