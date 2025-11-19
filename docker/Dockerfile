FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL


COPY . /usr/src/app
WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile 
RUN pnpm run -r build
RUN pnpm deploy --filter=@reputo/api --prod --legacy --ignore-scripts /prod/api
RUN pnpm deploy --filter=@reputo/workflows --prod --legacy --ignore-scripts /prod/workflows

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS ui
COPY --from=build /usr/src/app/apps/ui/.next/standalone /prod/ui
COPY --from=build /usr/src/app/apps/ui/public /prod/ui/apps/ui/public
COPY --from=build /usr/src/app/apps/ui/.next/static /prod/ui/apps/ui/.next/static
WORKDIR /prod/ui
ENV PORT=8080
EXPOSE 8080
CMD ["node", "apps/ui/server.js"]

FROM base AS workflows
COPY --from=build /prod/workflows /prod/workflows
WORKDIR /prod/workflows
CMD [ "pnpm", "start" ]

 19-s3-upload-service
  24-feature-packagesreputation-algorithms---runtime-metadata
  25-feature-packagesstorage-shared-storage-package
  26-feature-appsworkflows---snapshot-execution-workflows-app
  4-implement-reputation-algorithm-library
  6-algorithmpreset-snapshot-schemas-crud
  9-ui-implementation
  ci/optimize
  docker/expose-mongodb
  feat/add-filter-by-algorithmpreset
  feat/algorithm-preset-frozen
  fix/snapshot-schema
  hotfix-ui-api-env
* main
  pullpreview/s3
  refactor
  update-readme
  update/readme
  update/snapshot-output-type