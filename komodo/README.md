# Komodo Core

This directory contains the dedicated-host deployment for Komodo Core at
`https://komodo.logid.xyz`. It is intentionally separate from the staging and
production hosts.

## Host Shape

- Dedicated VM only for Komodo, not colocated with staging or production.
- Minimum size: 1 vCPU / 2 GB RAM.
- Docker Engine with the Compose plugin.
- Ports `80/tcp` and `443/tcp` open to the internet.
- Cloudflare DNS record `komodo.logid.xyz` points to the VM public IP.

## Files

- `core/docker-compose.komodo.yml` runs Traefik, Komodo Core, FerretDB,
  Postgres, and a self-Periphery agent.
- `core/core.env.example` is the non-secret template. Copy it to
  `core/core.env` on the host and fill values from the password manager.

Komodo's Postgres-backed mode uses FerretDB in front of Postgres because Core
speaks the MongoDB wire protocol.

## GitHub OAuth

Create a GitHub OAuth app owned by the organization:

- Homepage URL: `https://komodo.logid.xyz`
- Authorization callback URL: `https://komodo.logid.xyz/auth/github/callback`

Put the client ID and client secret in `core/core.env`. GitHub organization
membership is enforced operationally by owning/approving the OAuth app in the
organization and by leaving `KOMODO_ENABLE_NEW_USERS=false`, so new accounts
must be enabled by an admin after their first login.

## Deploy

On the dedicated VM:

```bash
mkdir -p /opt/reputo
cd /opt/reputo

# Get this repository onto the host, then:
cp komodo/core/core.env.example komodo/core/core.env
chmod 600 komodo/core/core.env

# Edit core.env and replace every CHANGE_ME value from the password manager.
sudo mkdir -p \
  /etc/komodo/traefik/certs \
  /etc/komodo/core/data/postgres \
  /etc/komodo/core/data/ferretdb-state \
  /etc/komodo/core/data/keys \
  /etc/komodo/core/data/syncs \
  /etc/komodo/core/data/repo-cache \
  /etc/komodo/core/backups

# FerretDB runs as UID/GID 1000 and must be able to write /state/state.json.
sudo chown -R 1000:1000 /etc/komodo/core/data/ferretdb-state

sudo touch /etc/komodo/traefik/certs/cloudflare-acme.json
sudo chmod 600 /etc/komodo/traefik/certs/cloudflare-acme.json

docker compose \
  -f komodo/core/docker-compose.komodo.yml \
  --env-file komodo/core/core.env \
  up -d
```

## Staging And Production Periphery

Run this on the existing staging and production hosts only. PullPreview hosts
stay on their current path. The install keeps Periphery separate from the app
compose files, labels it out of Watchtower updates, and leaves Watchtower
authoritative for deploys.

On each target host:

```bash
cp komodo/periphery/periphery.env.example komodo/periphery/periphery.env
chmod 600 komodo/periphery/periphery.env

# Edit periphery.env:
# - KOMODO_PASSKEY: same value as Core's KOMODO_PASSKEY
# - PERIPHERY_ALLOWED_IPS: Core IP /32 or VPN CIDR
# - PERIPHERY_PUBLISH_IP: private/VPN host IP reachable from Core

komodo/periphery/install.sh --env-file komodo/periphery/periphery.env
```

Keep these defaults until Komodo takes over deployments:

- `PERIPHERY_DISABLE_TERMINALS=true`
- `PERIPHERY_DISABLE_CONTAINER_TERMINALS=true`
- no Komodo `Stack` or `Deployment` resources for the existing app stack

Register each host in the Komodo UI:

- Server name: `staging` or `production`
- Address: `http://<PERIPHERY_PUBLISH_IP>:8120` when
  `PERIPHERY_SSL_ENABLED=false`
- Auth/passkey: the same `KOMODO_PASSKEY` used by Core and Periphery

Verification commands on the target host:

```bash
docker compose \
  -f /etc/komodo/periphery/docker-compose.yml \
  --env-file /etc/komodo/periphery/periphery.env \
  ps

docker ps --filter name=watchtower --filter status=running
docker restart komodo-periphery
sleep 30
docker ps --filter name=komodo-periphery --format '{{.Names}} {{.Status}}'
ss -ltnp | grep ':8120'
```

From a network that is not Core or the VPN, `nc -vz <host-public-ip> 8120`
must fail. Use the host/cloud firewall or private/VPN routing to make the port
unreachable from the public internet; `PERIPHERY_ALLOWED_IPS` is defense in
depth, not the public exposure control.

## Backup

Include these host paths in the VM backup policy:

- `/etc/komodo/core/data/postgres`
- `/etc/komodo/core/backups`
- `/etc/komodo/core/data/keys`
- `/etc/komodo/traefik/certs`

Komodo v1.19+ creates a daily "Backup Core Database" procedure on new installs
when init resources are enabled. The Core container mounts
`/etc/komodo/core/backups` to `/backups` for those logical backups.

For an explicit Postgres dump:

```bash
docker compose \
  -f komodo/core/docker-compose.komodo.yml \
  --env-file komodo/core/core.env \
  --profile backup \
  run --rm postgres-backup
```

## Verification

```bash
docker compose \
  -f komodo/core/docker-compose.komodo.yml \
  --env-file komodo/core/core.env \
  ps

curl -I https://komodo.logid.xyz/
```

Expected checks:

- `https://komodo.logid.xyz/` presents a valid Cloudflare/Let's Encrypt TLS
  certificate from Traefik.
- A fresh browser can complete GitHub OAuth login.
- The first successful login is enabled as the initial admin.
- Restarting `komodo-core` preserves users, sessions, and resources.
- Power-cycling the VM brings Traefik, Postgres, FerretDB, Core, and Periphery
  back up with `restart: unless-stopped`.
- The webhook secret in `core.env` matches any GitHub webhook configured later.
