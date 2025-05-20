#!/bin/bash
set -e

echo "Waiting for database to be ready..."
# Wait for PostgreSQL to be ready
for i in {1..30}; do
  if pg_isready -h db -U postgres; then
    echo "Database is ready!"
    break
  fi
  echo "Waiting for database connection... ($i/30)"
  sleep 1
done

echo "Creating database tables and initial data..."
cd /app
python -m app.db.create_tables

echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
