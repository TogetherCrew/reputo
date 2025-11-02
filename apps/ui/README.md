# @reputo/ui

Next.js-based frontend for Reputo. Built with Next.js 15 (App Router), React 19, Tailwind CSS v4, Radix UI, and TanStack Query. Ships as a standalone server output for Docker.

## Features

- Next.js 15 App Router with Turbopack dev/build
- Tailwind CSS v4 + Radix UI components
- React 19 + Server/Client Components
- TanStack Query for data fetching
- Standalone output for container runtime

## Development

```bash
# Start development server (Turbopack)
pnpm --filter @reputo/ui dev

# Local URL
open http://localhost:3000
```

## Build & Start

```bash
# Build (Turbopack)
pnpm --filter @reputo/ui build

# Start production server
pnpm --filter @reputo/ui start
```

## Environment Variables

Create `.env.local` from `envs.example` and set the public API base URL used by the UI:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

See `envs.example` for details.

## Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS v4, Radix UI
- TanStack Query, Zod

## Links

- UI (staging): https://staging.logid.xyz
- UI (production): https://logid.xyz

## License

Released under the **GPL-3.0** license. See [LICENSE](../../LICENSE).
