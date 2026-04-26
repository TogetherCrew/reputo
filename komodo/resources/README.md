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
The staging app stack is authoritative for staging deploys in Phase 5:
`poll_for_updates = true`, `webhook_enabled = true`,
`webhook_force_deploy = true`, and `deploy = false`. This lets GitHub Actions
POST to the staging Stack webhook after a successful image build while keeping
mutable `staging` tags reliable with `compose pull && up -d`.

The production app stack uses the same Komodo posture for Phase 6. GitHub
Actions still performs the digest-based production retag, then calls the
`promote-production` Procedure webhook so Komodo runs `DeployStack` for
`reputo-apps-production`. Infra stacks keep polling and webhooks disabled.

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

## Phase 5 Staging Cutover

GitHub Actions calls the staging Stack webhook at
`https://komodo.logid.xyz/listener/github/stack/reputo-apps-staging/deploy`.
Configure the GitHub `staging` environment secret `KOMODO_WEBHOOK_SECRET` with
the same value as Komodo Core before merging the workflow change.
The workflow remains gated on `affected-count != '0'`; use a no-op change in a
deployable app workspace for validation rather than an empty commit.

After the resource sync applies the staging Stack change, stop Watchtower only
on the staging host:

```sh
docker stop watchtower
docker rm watchtower
```

Leave production Watchtower and the `reputo-infra` stacks unchanged. Observe at
least one full week of staging deploys before Phase 6. Roll back by disabling
staging Komodo polling/webhook deploys and starting Watchtower from the infra
Compose stack again.

## Phase 6 Production Cutover

Do not apply the production cutover until Phase 5 has been stable for at least
one week.

Before the first Komodo-driven production promotion, stop Watchtower on the
production host and verify it is not running:

```sh
docker stop watchtower
docker ps --filter name=watchtower --filter status=running
```

Configure the GitHub `production` environment secret `KOMODO_WEBHOOK_SECRET`
with the same value as Komodo Core. The production promotion workflow calls:

```text
https://komodo.logid.xyz/listener/github/procedure/promote-production/__ANY__
```

Configure Komodo RBAC so only the `release-managers` group has `Execute` on the
`promote-production` Procedure. Do not grant `Execute` on that Procedure to
`Everyone` or broad non-release groups. Admin users still retain their Komodo
admin privileges.

Validation checklist:

- Promote a known `sha-<commit>` with `.github/workflows/promote-production.yml`
  and confirm Komodo deploys `reputo-apps-production`.
- Promote a missing SHA and confirm the workflow fails before retagging or
  calling Komodo.
- Attempt to run the Procedure as a non-release-manager and confirm Komodo
  blocks execution.
- Confirm the Komodo audit log shows the production Procedure run and the
  promoted commit SHA from the webhook payload.

Rollback:

1. Disable the production app Stack webhook and polling in
   `stacks/reputo-apps.toml`.
2. Disable the `promote-production` Procedure webhook.
3. Re-enable Watchtower on production:

```sh
docker start watchtower
```
