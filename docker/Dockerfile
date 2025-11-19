FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=1
RUN corepack enable pnpm

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /usr/src/app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/ui/package.json apps/ui/
COPY apps/workflows/package.json apps/workflows/
COPY packages/database/package.json packages/database/
COPY packages/reputation-algorithms/package.json packages/reputation-algorithms/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run -r build
RUN pnpm deploy --filter=@reputo/api --prod --ignore-scripts /prod/api
RUN pnpm deploy --filter=@reputo/workflows --prod --ignore-scripts /prod/workflows

FROM base AS api
ENV NODE_ENV=production
WORKDIR /prod/api
COPY --from=build /prod/api ./
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS ui
ENV NODE_ENV=production
WORKDIR /prod/ui
COPY --from=build /usr/src/app/apps/ui/.next/standalone ./
COPY --from=build /usr/src/app/apps/ui/public ./apps/ui/public
COPY --from=build /usr/src/app/apps/ui/.next/static ./apps/ui/.next/static
ENV PORT=8080
EXPOSE 8080
CMD ["node", "apps/ui/server.js"]

FROM base AS workflows
ENV NODE_ENV=production
WORKDIR /prod/workflows
COPY --from=build /prod/workflows ./
CMD [ "pnpm", "start" ]