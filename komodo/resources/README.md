# Komodo Resources

This directory contains the declarative Komodo resources for Reputo. Core syncs
the tree from the `main` branch through the `reputo-main` ResourceSync in
`_sync.toml`.

## Layout

- `_sync.toml` defines the ResourceSync itself. `managed = false` and
  `delete = false` keep this first iteration non-destructive.
- `servers.toml` defines the staging and production Periphery servers.
- `stacks/reputo-infra.toml` defines staging and production infra stacks from
  `docker/compose/infra.yml` plus `docker/compose/observability.yml`.
- `stacks/reputo-apps.toml` defines staging and production app stacks from
  `docker/compose/apps.yml`.
- `procedures/promote-production.toml` defines the manual production deploy
  procedure that can be used after GitHub Actions promotes image tags.
- `alerters/slack.toml` defines the Slack alerter.
- `schedules/prune-images.toml` defines a scheduled Procedure. Komodo schedules
  are stored on Procedures or Actions, not as standalone `[[schedule]]`
  resources.

## Stack Posture

The Stack resources point at the existing host checkout in `/opt/reputo` and
reuse the split Compose files instead of duplicating Compose YAML into Komodo.
Both app stacks keep `poll_for_updates = false`, `webhook_enabled = false`, and
`deploy = false` until Phase 5. Infra stacks also keep polling disabled.

Each stack writes a Komodo-managed env file at deploy time from the TOML
`environment` block:

- `.komodo-reputo-infra-staging.env`
- `.komodo-reputo-infra-production.env`
- `.komodo-reputo-apps-staging.env`
- `.komodo-reputo-apps-production.env`

Those files are generated on the target host and are passed to Docker Compose
with `--env-file`. The checked-in TOML references Komodo variables and secrets
only by `[[NAME]]`; resolved values must not be committed.

The environment deliberately keeps the existing channel tags:

- staging stacks set `IMAGE_TAG=staging`
- production stacks set `IMAGE_TAG=production`

Per-service env files such as `docker/env/api.env` and
`docker/env/workflows.env` remain host-local runtime files and are not committed
or synced here. After the secret cutover, those files should contain only
non-secret config; secrets are provided by Komodo through the stack environment
and wired into the Compose services with explicit `environment` entries.

Deploy the infra stack before the apps stack. The apps Compose file is valid as
a standalone Komodo stack and therefore does not declare `depends_on`
relationships to services owned by the infra stack.

## Required Komodo Variables And Secrets

Create these in Komodo before deploying or testing the resources.

- `KOMODO_PASSKEY`
- `KOMODO_WEBHOOK_SECRET`
- `KOMODO_SLACK_WEBHOOK_URL`
- `STAGING_PERIPHERY_ADDRESS`
- `PRODUCTION_PERIPHERY_ADDRESS`

For each environment prefix, `STAGING` and `PRODUCTION`, create these
non-secret variables:

- `<ENV>_TRAEFIK_DOMAIN`
- `<ENV>_UI_DOMAIN`
- `<ENV>_API_DOMAIN`
- `<ENV>_TEMPORAL_UI_DOMAIN`
- `<ENV>_GRAFANA_DOMAIN`
- `<ENV>_ALLOWED_ORIGINS`
- `<ENV>_GRAFANA_ADMIN_USER`

For each environment prefix, `STAGING` and `PRODUCTION`, create these secrets:

- `<ENV>_TRAEFIK_AUTH`
- `<ENV>_CF_DNS_API_TOKEN`
- `<ENV>_GRAFANA_AUTH`
- `<ENV>_MONGODB_USER`
- `<ENV>_MONGODB_PASSWORD`
- `<ENV>_TEMPORAL_POSTGRES_USER`
- `<ENV>_TEMPORAL_POSTGRES_PASSWORD`
- `<ENV>_ONCHAIN_DATA_POSTGRES_USER`
- `<ENV>_ONCHAIN_DATA_POSTGRES_PASSWORD`
- `<ENV>_GRAFANA_ADMIN_PASSWORD`
- `<ENV>_AWS_ACCESS_KEY_ID`
- `<ENV>_AWS_SECRET_ACCESS_KEY`
- `<ENV>_DEEP_ID_CLIENT_SECRET`
- `<ENV>_AUTH_TOKEN_ENCRYPTION_KEY`
- `<ENV>_DEEPFUNDING_API_KEY`
- `<ENV>_ALCHEMY_API_KEY`
- `<ENV>_BLOCKFROST_API_KEY`

Store htpasswd-style values such as `<ENV>_TRAEFIK_AUTH` and
`<ENV>_GRAFANA_AUTH` with the doubled `$$` escaping preserved exactly as it
appears in the current Compose env files.

Configure the GHCR PAT in Komodo under Settings > Providers as a Docker
registry account for `ghcr.io`. Attach that registry account to the stacks if
image pulls require authentication; do not model the PAT as a stack
environment variable.

Recommended tags:

- `env:staging` or `env:production`
- `scope:cloudflare`, `scope:traefik`, `scope:grafana`, `scope:mongodb`,
  `scope:postgres`, `scope:aws`, `scope:deep-id`, `scope:deepfunding`,
  `scope:onchain`, or `scope:ghcr`

Cutover order:

1. Add the variables and secrets in Komodo first.
2. Deploy through Komodo and confirm all services start.
3. Compare selected container env values before and after migration without
   printing secrets to logs.
4. Remove secret keys from host `docker/env/*.env` files.
5. Leave `docker/env/examples/*.env.example` unchanged.

Keep secrets in Komodo or the password manager only. Do not commit resolved
values.
