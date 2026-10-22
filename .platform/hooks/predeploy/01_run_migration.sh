#!/bin/bash
set -e

echo "=== TravelWaste database migration ==="

cd /var/app/staging

node dist/scripts/runMigration.js

echo "=== Migration completed ==="