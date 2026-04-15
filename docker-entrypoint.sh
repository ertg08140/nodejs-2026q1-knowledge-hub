#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seeds..."
npm run prisma:seed

echo "Starting application..."
exec "$@"