#!/bin/bash

# MongoDB Replica Set Initialization Script
# This script initializes a single-node replica set for transaction support

set -e

echo "Waiting for MongoDB to be ready..."
TIMEOUT=60  # 60 seconds timeout
COUNTER=0
until mongosh --host mongodb:27017 --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
  COUNTER=$((COUNTER + 1))
  if [ $COUNTER -gt $TIMEOUT ]; then
    echo "ERROR: MongoDB failed to start within $TIMEOUT seconds"
    exit 1
  fi
  echo "MongoDB is not ready yet. Waiting... ($COUNTER/$TIMEOUT)"
  sleep 1
done

echo "Initializing replica set..."
mongosh --host mongodb:27017 --eval "
  try {
    rs.initiate({
      _id: 'rs0',
      members: [
        { _id: 0, host: 'mongodb:27017' }
      ]
    });
    print('Replica set initialized successfully');
  } catch (e) {
    if (e.message.includes('already initialized')) {
      print('Replica set already initialized');
    } else {
      print('Error initializing replica set:', e.message);
      throw e;
    }
  }
"

echo "Waiting for replica set to be ready..."
TIMEOUT=30  # 30 seconds timeout for replica set
COUNTER=0
until mongosh --host mongodb:27017 --eval "rs.status().ok" | grep -q "1"; do
  COUNTER=$((COUNTER + 1))
  if [ $COUNTER -gt $TIMEOUT ]; then
    echo "ERROR: Replica set failed to initialize within $TIMEOUT seconds"
    exit 1
  fi
  echo "Replica set is not ready yet. Waiting... ($COUNTER/$TIMEOUT)"
  sleep 1
done

echo "Replica set is ready!"
