FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm run -r build
RUN pnpm deploy --filter=api --prod /prod/api
RUN pnpm deploy --filter=ui --prod /prod/ui
RUN pnpm deploy --filter=workflows --prod /prod/workflows

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