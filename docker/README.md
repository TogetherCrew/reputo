# Docker Environment Configuration

This directory contains environment configuration files for different deployment scenarios.

## Environment Files Structure

### Local Development Files (Committed to Repository)

- **`api.env`** - API service configuration for local development
    - Contains safe local development values
    - MongoDB connection to local MongoDB container
    - Used by `docker-compose.local.yml`

- **`mongodb.env`** - MongoDB service configuration for local development
    - Contains MongoDB root credentials for local development
    - Used by MongoDB container initialization

### Production Files (Gitignored)

- **`shared.env`** - Infrastructure/shared variables for production
    - Copy from `shared.env.example` and update with your values
    - Contains domains, image tags, Traefik configuration
    - Used by `docker-compose.yml`

- **`api.env`** - API service configuration for production
    - Create with production-specific values
    - MongoDB connection to production MongoDB
    - Used by `docker-compose.yml`

- **`mongodb.env`** - MongoDB service configuration for production
    - Create with production-specific credentials
    - Used by MongoDB container initialization

### Template Files

- **`shared.env.example`** - Template for production shared variables
    - Copy to `shared.env` and update with your actual values

## Usage by Environment

### Local Development

```bash
cd docker
docker-compose -f docker-compose.local.yml up -d
```

Uses committed `api.env` and `mongodb.env` files with safe local values.

### Preview/CI Environment

CI/CD creates temporary `api.env` and `mongodb.env` files with preview-specific values.
Uses `docker-compose.preview.yml`.

### Production Environment

1. Copy `shared.env.example` to `shared.env` and update values
2. Create `api.env` and `mongodb.env` with production values
3. Deploy using `docker-compose.yml`

## MongoDB Replica Set

All MongoDB instances are configured as replica sets (`rs0`) to support transactions.
The connection string includes `replicaSet=rs0` parameter.

## Security Notes

- Local development files (`api.env`, `mongodb.env`) are committed with safe default values
- Production files (`shared.env`, production `api.env`, production `mongodb.env`) are gitignored
- Never commit production credentials to the repository
