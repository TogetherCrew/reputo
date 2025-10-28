FROM node:22.20.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# WORKDIR /usr/src/app
# COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
# COPY apps/ ./apps/
# copy packjson install -> copy src and build
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
# Copy Next.js standalone build output and assets
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