# syntax=docker/dockerfile:1

FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/workflows/package.json apps/workflows/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/deepfunding-portal-api/package.json packages/deepfunding-portal-api/package.json
COPY packages/onchain-data/package.json packages/onchain-data/package.json
COPY packages/reputation-algorithms/package.json packages/reputation-algorithms/package.json
COPY packages/storage/package.json packages/storage/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --filter @reputo/workflows... --frozen-lockfile

FROM deps AS build
COPY apps/workflows apps/workflows
COPY packages/database packages/database
COPY packages/deepfunding-portal-api packages/deepfunding-portal-api
COPY packages/onchain-data packages/onchain-data
COPY packages/reputation-algorithms packages/reputation-algorithms
COPY packages/storage packages/storage
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/workflows... build
RUN pnpm deploy --filter @reputo/workflows --prod /prod/workflows

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /prod/workflows
COPY --from=build /prod/workflows ./
CMD ["pnpm", "start:orchestrator"]
