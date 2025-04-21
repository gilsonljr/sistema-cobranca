#!/bin/bash
echo "Running database migrations..."
python -m app.db.init_db
exec "$@"
