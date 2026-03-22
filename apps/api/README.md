# @reputo/api

NestJS application that exposes the Reputo HTTP API.

## Surface

- URI-versioned routes under `/api/v1`
- algorithm preset CRUD at `/algorithm-presets`
- snapshot create/list/get/delete plus SSE updates at `/snapshots` and `/snapshots/events`
- storage upload verification, presigned downloads, and attachment streaming at `/storage`
- health check at `/healthz`
- interactive docs at `/reference` and `/api/docs`

## Commands

```bash
pnpm --filter @reputo/api dev
pnpm --filter @reputo/api build
pnpm --filter @reputo/api start
pnpm --filter @reputo/api test
pnpm --filter @reputo/api test:e2e
pnpm --filter @reputo/api typecheck
```

`pnpm --filter @reputo/api dev` builds and watches its shared package dependencies before starting Nest. `dev:app` is the internal app-only process used by the root monorepo `pnpm dev`.

## Config

Use `apps/api/envs.example` as the local reference file. The API expects MongoDB, storage/AWS, and Temporal settings before startup. Local development listens on `http://localhost:3000` unless `PORT` overrides it.
