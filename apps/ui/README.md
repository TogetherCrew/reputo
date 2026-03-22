# @reputo/ui

Next.js dashboard for browsing algorithms, creating presets, launching snapshots, and following snapshot progress.

## Surface

- redirects `/` to `/dashboard`
- loads algorithm definitions from `@reputo/reputation-algorithms`
- calls the backend through same-origin `/api/v1` requests
- listens to snapshot status changes over SSE
- builds as a standalone Next.js server for container runtime

## Commands

```bash
pnpm --filter @reputo/ui dev
pnpm --filter @reputo/ui build
pnpm --filter @reputo/ui start
pnpm --filter @reputo/ui test
pnpm --filter @reputo/ui typecheck
```

`pnpm --filter @reputo/ui dev` builds and watches its shared package dependencies before starting Next.js. `dev:app` is the internal app-only process used by the root monorepo `pnpm dev`.

## Config

Local development runs on `http://localhost:4000`. If the API is running separately, set `API_PROXY_TARGET=http://localhost:3000` in `apps/ui/.env` so Next.js rewrites `/api/*` to the API server. Behind Traefik or another reverse proxy, the UI keeps using same-origin `/api` requests.
