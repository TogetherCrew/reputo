# syntax=docker/dockerfile:1

FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/algorithm-validator/package.json packages/algorithm-validator/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/reputation-algorithms/package.json packages/reputation-algorithms/package.json
COPY packages/storage/package.json packages/storage/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --filter @reputo/api... --frozen-lockfile

FROM deps AS build
COPY apps/api apps/api
COPY packages/algorithm-validator packages/algorithm-validator
COPY packages/database packages/database
COPY packages/reputation-algorithms packages/reputation-algorithms
COPY packages/storage packages/storage
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/api... build
RUN pnpm deploy --filter @reputo/api --prod /prod/api

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /prod/api
COPY --from=build /prod/api ./
EXPOSE 3000
CMD ["pnpm", "start"]
