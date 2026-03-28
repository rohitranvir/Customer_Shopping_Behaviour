#!/bin/bash
set -e

echo "============================================"
echo "  ChatApp - Setup & Launch Script"
echo "============================================"
echo ""

# Step 1: Start database and Redis
echo "▶ [1/7] Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
echo "  ✓ PostgreSQL and Redis started."
echo ""

# Step 2: Wait for services to be ready
echo "▶ [2/7] Waiting 5 seconds for services to initialize..."
sleep 5
echo "  ✓ Ready."
echo ""

# Step 3: Create migrations for accounts app
echo "▶ [3/7] Creating migrations for accounts..."
docker-compose run --rm backend python manage.py makemigrations accounts
echo "  ✓ accounts migrations created."
echo ""

# Step 4: Create migrations for rooms app
echo "▶ [4/7] Creating migrations for rooms..."
docker-compose run --rm backend python manage.py makemigrations rooms
echo "  ✓ rooms migrations created."
echo ""

# Step 5: Create migrations for messages_app
echo "▶ [5/7] Creating migrations for messages_app..."
docker-compose run --rm backend python manage.py makemigrations messages_app
echo "  ✓ messages_app migrations created."
echo ""

# Step 6: Apply all migrations
echo "▶ [6/7] Applying database migrations..."
docker-compose run --rm backend python manage.py migrate
echo "  ✓ All migrations applied."
echo ""

# Step 7: Build and start all services
echo "▶ [7/7] Building and starting all services..."
docker-compose up --build
echo ""
echo "============================================"
echo "  ✓ ChatApp is running!"
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:8000"
echo "  Admin    → http://localhost:8000/admin/"
echo "============================================"
