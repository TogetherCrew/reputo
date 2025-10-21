FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
# WORKDIR /usr/src/app
# COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
# COPY apps/ ./apps/
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile 
RUN pnpm run -r build
RUN pnpm deploy --filter=@reputo/api --prod --legacy --ignore-scripts /prod/api
RUN pnpm deploy --filter=@reputo/ui --prod --legacy --ignore-scripts /prod/ui
RUN pnpm deploy --filter=@reputo/workflows --prod --legacy --ignore-scripts /prod/workflows

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS ui
COPY --from=build /prod/ui /prod/ui
WORKDIR /prod/ui
RUN npm install --global --no-update-notifier http-server
EXPOSE 8080
CMD ["http-server", "dist", "-p", "8080"]

FROM base AS workflows
COPY --from=build /prod/workflows /prod/workflows
WORKDIR /prod/workflows
CMD [ "pnpm", "start" ]