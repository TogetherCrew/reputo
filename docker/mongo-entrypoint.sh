#!/bin/bash
set -e

# Copy keyfile with correct permissions for MongoDB
if [ -f /data/mongo-keyfile-source ]; then
    cp /data/mongo-keyfile-source /data/mongo-keyfile
    chmod 400 /data/mongo-keyfile
    chown mongodb:mongodb /data/mongo-keyfile
fi

# Execute the original entrypoint
exec docker-entrypoint.sh "$@"
