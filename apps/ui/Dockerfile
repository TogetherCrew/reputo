# syntax=docker/dockerfile:1

FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ui/package.json apps/ui/package.json
COPY packages/algorithm-validator/package.json packages/algorithm-validator/package.json
COPY packages/reputation-algorithms/package.json packages/reputation-algorithms/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --filter @reputo/ui... --frozen-lockfile

FROM deps AS build
COPY vitest.base.ts vitest.base.ts
COPY apps/ui apps/ui
COPY packages/algorithm-validator packages/algorithm-validator
COPY packages/reputation-algorithms packages/reputation-algorithms
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/ui... build

FROM node:22.20.0-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /usr/src/app/apps/ui/.next/standalone ./
COPY --from=build /usr/src/app/apps/ui/.next/static ./apps/ui/.next/static
COPY --from=build /usr/src/app/apps/ui/public ./apps/ui/public

EXPOSE 8080
CMD ["node", "apps/ui/server.js"]
