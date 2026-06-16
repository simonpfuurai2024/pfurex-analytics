#!/bin/bash
set -e
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do sleep 1; done
echo "Running Alembic migrations..."
alembic upgrade head
echo "Seeding reference data..."
python scripts/seed_reference_data.py
echo "Starting Pfurex Analytics backend..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
