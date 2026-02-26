# syntax=docker/dockerfile:1

FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable
WORKDIR /usr/src/app

FROM base AS deps
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build-api
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/api... build
RUN pnpm deploy --filter=@reputo/api --prod /prod/api

FROM base AS api
COPY --from=build-api /prod/api /prod/api
WORKDIR /prod/api
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]

FROM deps AS build-ui
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/ui... build

FROM node:22.20.0-slim AS ui
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build-ui /usr/src/app/apps/ui/.next/standalone ./
COPY --from=build-ui /usr/src/app/apps/ui/.next/static ./.next/static
COPY --from=build-ui /usr/src/app/apps/ui/public ./public

EXPOSE 8080
CMD ["node", "apps/ui/server.js"]

FROM deps AS build-workflows
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @reputo/workflows... build
RUN pnpm deploy --filter=@reputo/workflows --prod /prod/workflows

FROM base AS workflows
COPY --from=build-workflows /prod/workflows /prod/workflows
WORKDIR /prod/workflows
ENV NODE_ENV=production
ENV PORT=8088
EXPOSE 8088
CMD ["pnpm", "start"]