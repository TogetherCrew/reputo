# Komodo Resources

This directory contains the declarative Komodo resources for Reputo. Core syncs
the tree from the `main` branch through the `reputo-main` ResourceSync in
`_sync.toml`.

## Layout

- `_sync.toml` defines the ResourceSync itself. `managed = false` and
  `delete = false` keep sync execution reviewable and non-destructive.
- `servers.toml` defines the staging and production Periphery servers.
- `stacks/reputo-infra.toml` defines staging and production infra stacks from
  `docker/compose/infra.yml` plus `docker/compose/observability.yml`.
- `stacks/reputo-apps.toml` defines staging and production app stacks from
  `docker/compose/apps.yml`.
- `procedures/promote-production.toml` defines the manual production deploy
  procedure used after GitHub Actions promotes image tags.
- `user-groups.toml` defines the `admins`, `engineers`, and
  `release-managers` RBAC groups.
- `alerters/slack.toml` defines the Slack alerter.
- `schedules/prune-images.toml` defines a scheduled Procedure. Komodo schedules
  are stored on Procedures or Actions, not as standalone `[[schedule]]`
  resources.

## Stack Posture

The Stack resources point at the existing host checkout in `/opt/reputo` and
reuse the split Compose files instead of duplicating Compose YAML into Komodo.

The staging app stack is authoritative for staging deploys:
`poll_for_updates = true`, `webhook_enabled = true`,
`webhook_force_deploy = true`, and `deploy = false`. GitHub Actions POSTs to
the staging Stack webhook after a successful image build so mutable `staging`
tags are deployed with `compose pull && up -d`.

The production app stack uses the same Komodo posture. GitHub Actions performs
the digest-based production retag, then calls the `promote-production`
Procedure webhook so Komodo runs `DeployStack` for
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
or synced here. Those files should contain only non-secret config; secrets are
provided by Komodo through the stack environment and wired into the Compose
services with explicit `environment` entries.

Deploy the infra stack before the apps stack. The apps Compose file is valid as
a standalone Komodo stack and therefore does not declare `depends_on`
relationships to services owned by the infra stack.

## RBAC

`_sync.toml` has `include_user_groups = true`, so the three UserGroups in
`user-groups.toml` are part of the resource sync. Keep individual user
membership out of Git and manage membership in the Komodo UI after the groups
exist.

Permission matrix:

| Group | Permissions |
| --- | --- |
| `admins` | `Write` on managed Reputo Servers, Stacks, Procedures, Alerters, and ResourceSyncs |
| `engineers` | `Execute` on staging stacks; `Read` on production server, production stacks, and `promote-production` |
| `release-managers` | `Execute` on `promote-production`; `Read` on the production server and production app stack |

Komodo platform admin status is separate from the `admins` UserGroup and is
still granted by a super admin in the UI.

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

Configure the GHCR PAT in Komodo under `Settings > Providers` as a Docker
registry account for `ghcr.io`. Attach that registry account to the stacks if
image pulls require authentication; do not model the PAT as a stack
environment variable.

Recommended tags:

- `env:staging` or `env:production`
- `scope:cloudflare`, `scope:traefik`, `scope:grafana`, `scope:mongodb`,
  `scope:postgres`, `scope:aws`, `scope:deep-id`, `scope:deepfunding`,
  `scope:onchain`, or `scope:ghcr`

Cutover order for secrets and RBAC:

1. Add the variables and secrets in Komodo first.
2. Sync resources and UserGroups.
3. Add users to the appropriate UserGroups in the UI.
4. Deploy through Komodo and confirm all services start.
5. Compare selected container env values before and after migration without
   printing secrets to logs.
6. Remove secret keys from host `docker/env/*.env` files.
7. Leave `docker/env/examples/*.env.example` unchanged.

Keep secrets in Komodo or the password manager only. Do not commit resolved
values.

## Webhooks

GitHub Actions calls the staging Stack webhook at:

```text
https://komodo.logid.xyz/listener/github/stack/reputo-apps-staging/deploy
```

Configure the GitHub `staging` environment secret `KOMODO_WEBHOOK_SECRET` with
the same value as Komodo Core. The workflow remains gated on
`affected-count != '0'`; use a no-op change in a deployable app workspace for
validation rather than an empty commit.

The production promotion workflow calls:

```text
https://komodo.logid.xyz/listener/github/procedure/promote-production/__ANY__
```

Configure the GitHub `production` environment secret `KOMODO_WEBHOOK_SECRET`
with the same value as Komodo Core.

## Validation Checklist

- Execute the ResourceSync and confirm it creates or updates the three
  UserGroups.
- As an `engineers` member, execute `reputo-apps-staging`.
- As an `engineers` member, confirm `promote-production` cannot be executed.
- As a `release-managers` member, execute `promote-production`.
- Promote a known `sha-<commit>` with
  `.github/workflows/promote-production.yml` and confirm Komodo deploys
  `reputo-apps-production`.
- Promote a missing SHA and confirm the workflow fails before retagging or
  calling Komodo.
- Confirm the Komodo audit log shows the production Procedure run and the
  promoted commit SHA from the webhook payload.
