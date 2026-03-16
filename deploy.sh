#!/bin/bash
set -e

TAG=$1
ENVIRONMENT=${2:-"local"}

# Special case: if TAG is "local" or "dev", skip git operations
LOCAL_ONLY=false
if [ "$TAG" = "local" ] || [ "$TAG" = "dev" ] || [ "$TAG" = "current" ]; then
    LOCAL_ONLY=true
    TAG="local-dev"
    ENVIRONMENT="local"
fi

# Load environment variables from .env file
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    echo "Loaded environment from .env file"
    echo "Key variables: DEPLOY_CONTAINER_PREFIX=$DEPLOY_CONTAINER_PREFIX, DEPLOY_SITE_PORT=$DEPLOY_SITE_PORT"
else
    echo "No .env file found. Please create one from .env.example"
    exit 1
fi

# Multi-tenant deployment configuration
case $ENVIRONMENT in
  "local"|"dev"|"development")
    echo "Local multi-tenant deployment"
    DEPLOY_DIR="$(pwd)"
    ;;
  "production"|"prod"|"server")
    echo "Server multi-tenant deployment"
    BASE_DIR="${DEPLOY_BASE_DIR:-/opt/${DEPLOY_CONTAINER_PREFIX}-app}"
    RELEASES_DIR="$BASE_DIR/releases"
    DEPLOY_DIR="$RELEASES_DIR/$TAG"
    CURRENT_LINK="$BASE_DIR/current"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Valid environments: local, production"
    exit 1
    ;;
esac

if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag> [environment]"
  echo "Example: $0 v1.0.0 local"
  echo "Example: $0 v1.0.0 production"
  echo "Example: $0 local          # Local development (no git fetch)"
  echo ""
  echo "Current configuration:"
  echo "  Industry: $INDUSTRY_VERTICAL"
  echo "  Port: $DEPLOY_SITE_PORT"
  echo "  Container: $DEPLOY_CONTAINER_PREFIX"
  exit 1
fi

echo "Multi-Tenant Deployment: $TAG ($ENVIRONMENT)"
if [ "$LOCAL_ONLY" = true ]; then
    echo "Local Development Mode (no git operations)"
fi
echo "Industry Vertical: $INDUSTRY_VERTICAL"
echo "Container Prefix: $DEPLOY_CONTAINER_PREFIX"
echo "Port: $DEPLOY_SITE_PORT"
echo ""

# Step 1: Ensure shared PostgreSQL database is running
echo "Step 1: Ensuring shared PostgreSQL database..."
if [ "$ENVIRONMENT" = "local" ] || [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    if docker ps -a --format "{{.Names}}" | grep -q "shared-postgres-multitenant"; then
        if ! docker ps --format "{{.Names}}" | grep -q "shared-postgres-multitenant"; then
            echo "Found stopped shared database container, starting it..."
            docker start shared-postgres-multitenant || true
        fi
    fi

    if ! ./manage-shared-db.sh start; then
        echo "Failed to start shared database"
        exit 1
    fi
else
    echo "Database handled by server bootstrap script"
fi

# Step 1.5: Ensure industry-specific database exists
echo "Step 1.5: Ensuring industry database '$INDUSTRY_VERTICAL' exists..."
if docker exec shared-postgres-multitenant psql -U multitenant_user -d postgres -lqt | cut -d \| -f 1 | grep -qw "$INDUSTRY_VERTICAL"; then
    echo "Database '$INDUSTRY_VERTICAL' already exists"
else
    echo "Creating database '$INDUSTRY_VERTICAL'..."
    docker exec shared-postgres-multitenant psql -U multitenant_user -d postgres -c "CREATE DATABASE \"$INDUSTRY_VERTICAL\";"
    echo "Database '$INDUSTRY_VERTICAL' created successfully"
fi

# Step 2: Handle environment-specific deployment
if [ "$ENVIRONMENT" = "local" ] || [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    echo "Step 2: Local deployment in current directory"

    echo "Stopping existing containers..."
    docker-compose down 2>/dev/null || true

    echo "Cleaning up orphaned containers..."
    docker rm -f "${DEPLOY_CONTAINER_PREFIX}-app" 2>/dev/null || true

    if docker ps -a --filter "name=${DEPLOY_CONTAINER_PREFIX}-app" --format "{{.Names}}" | grep -q "${DEPLOY_CONTAINER_PREFIX}-app"; then
        echo "Found existing containers with same name, forcing removal..."
        docker ps -a --filter "name=${DEPLOY_CONTAINER_PREFIX}-app" --format "{{.Names}}" | xargs -r docker rm -f
    fi

    echo "Building and starting $INDUSTRY_VERTICAL application..."
    docker compose up -d --build

else
    echo "Step 2: Production deployment"
    echo "Working in: $(pwd)"

    echo "Stopping current containers..."
    docker compose down 2>/dev/null || true

    echo "Cleaning up orphaned containers..."
    docker rm -f "${DEPLOY_CONTAINER_PREFIX}-app" 2>/dev/null || true

    if docker ps -a --filter "name=${DEPLOY_CONTAINER_PREFIX}-app" --format "{{.Names}}" | grep -q "${DEPLOY_CONTAINER_PREFIX}-app"; then
        echo "Found existing containers with same name, forcing removal..."
        docker ps -a --filter "name=${DEPLOY_CONTAINER_PREFIX}-app" --format "{{.Names}}" | xargs -r docker rm -f
    fi
    echo "Building and starting $INDUSTRY_VERTICAL application..."
    docker compose up -d --build
fi

# Step 3: Verify deployment
echo ""
echo "Multi-tenant deployment complete!"
echo "Industry: $INDUSTRY_VERTICAL"
echo "URL: http://localhost:$DEPLOY_SITE_PORT"
echo "Database: $INDUSTRY_VERTICAL database on shared PostgreSQL"
echo ""

echo "Container Status:"
docker compose ps

echo ""
echo "Quick Commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop app: docker compose down"
echo "  DB status: ./manage-shared-db.sh status"
echo "  DB logs: ./manage-shared-db.sh logs"
