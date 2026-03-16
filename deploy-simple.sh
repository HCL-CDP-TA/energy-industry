#!/bin/bash

# Simple Multi-tenant Energy Application Deployment Script
# Usage: ./deploy-simple.sh [local|staging|production]

ENVIRONMENT=${1:-"local"}

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    echo "No .env file found"
    exit 1
fi

# Multi-tenant configuration
INDUSTRY_VERTICAL=${INDUSTRY_VERTICAL:-"energy"}
DEPLOY_CONTAINER_PREFIX=${DEPLOY_CONTAINER_PREFIX:-"energy"}
DEPLOY_SITE_PORT=${DEPLOY_SITE_PORT:-3005}
DATABASE_URL="postgresql://multitenant_user:multitenant_password@localhost:5432/${INDUSTRY_VERTICAL}"

echo "Industry: $INDUSTRY_VERTICAL"
echo "Environment: $ENVIRONMENT"
echo "Container: $DEPLOY_CONTAINER_PREFIX"
echo "Port: $DEPLOY_SITE_PORT"

# Step 1: Start shared PostgreSQL
echo "Starting shared PostgreSQL..."
if ! ./manage-shared-db.sh start; then
    echo "Failed to start shared database"
    exit 1
fi

# Step 2: Ensure database exists
echo "Ensuring database '$INDUSTRY_VERTICAL' exists..."
if ! docker exec shared-postgres-multitenant psql -U multitenant_user -d postgres -lqt | cut -d \| -f 1 | grep -qw "$INDUSTRY_VERTICAL"; then
    echo "Creating database '$INDUSTRY_VERTICAL'..."
    docker exec shared-postgres-multitenant psql -U multitenant_user -d postgres -c "CREATE DATABASE \"$INDUSTRY_VERTICAL\";"
fi

# Step 3: Deploy application
echo "Deploying application..."

# Stop existing containers
docker-compose down 2>/dev/null || true
docker rm "${DEPLOY_CONTAINER_PREFIX}-app" 2>/dev/null || true

# Start application
docker-compose up -d --build

echo ""
echo "Deployment complete!"
echo "URL: http://localhost:$DEPLOY_SITE_PORT"
echo "Database: $INDUSTRY_VERTICAL"
