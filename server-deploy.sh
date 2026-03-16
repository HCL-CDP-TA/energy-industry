#!/bin/bash
set -e

# Bootstrap deployment script for production servers
# This script lives on the server and pulls the latest deploy.sh from git

TAG=$1
ENVIRONMENT=${2:-"production"}

if [ -z "$TAG" ]; then
    echo "Usage: $0 <tag> [environment]"
    echo ""
    echo "This is the server bootstrap script that:"
    echo "1. Pulls the latest deploy.sh from the git repository"
    echo "2. Uses your local .env configuration"
    echo "3. Runs the deployment with the latest deployment logic"
    echo ""
    echo "Examples:"
    echo "  $0 v1.0.0"
    echo "  $0 v1.0.0 production"
    exit 1
fi

REPO="https://github.com/HCL-CDP-TA/energy-industry.git"
BASE_DIR="${DEPLOY_BASE_DIR:-$(pwd)/${DEPLOY_CONTAINER_PREFIX:-energy}-app-deploy}"
RELEASES_DIR="$BASE_DIR/releases"
DEPLOY_DIR="$RELEASES_DIR/$TAG"
CURRENT_LINK="$BASE_DIR/current"
SERVER_ENV_FILE="$(realpath "$(dirname "$0")/.env")"

echo "Server Bootstrap Deployment: $TAG"
echo "Base Directory: $BASE_DIR"
echo "Environment File: $SERVER_ENV_FILE"
echo ""

# Verify environment file exists
if [ ! -f "$SERVER_ENV_FILE" ]; then
    echo "Environment file not found: $SERVER_ENV_FILE"
    echo "Please create .env file in the same directory as this script"
    exit 1
fi

# Create base directories
mkdir -p "$RELEASES_DIR"

# Clone or update the release
if [ -d "$DEPLOY_DIR" ]; then
    echo "Release $TAG already exists, updating..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git checkout "tags/$TAG" -B "release-$TAG"
else
    echo "Cloning release $TAG..."
    git clone "$REPO" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    git checkout "tags/$TAG" -b "release-$TAG"
fi

echo "Using deploy.sh from repository (tag: $TAG)"

# Copy server environment to release directory
echo "Copying server environment configuration..."
cp "$SERVER_ENV_FILE" "$DEPLOY_DIR/.env"

# Verify environment variables are loaded
echo "Verifying environment configuration..."
cd "$DEPLOY_DIR"
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    echo "Environment loaded successfully"
    echo "Key variables: DEPLOY_CONTAINER_PREFIX=$DEPLOY_CONTAINER_PREFIX, DEPLOY_SITE_PORT=$DEPLOY_SITE_PORT"
else
    echo "Environment file missing after copy"
    exit 1
fi

# Make deploy.sh executable
chmod +x "$DEPLOY_DIR/deploy.sh"

# Update current symlink
echo "Updating current symlink..."
ln -sfn "$DEPLOY_DIR" "$CURRENT_LINK"

# Ensure database setup
echo "Ensuring shared database is set up..."
if ! docker ps | grep -q shared-postgres-multitenant; then
    echo "Setting up multi-tenant database from scratch..."

    docker network create multitenant-network 2>/dev/null || true

    docker run -d \
        --name shared-postgres-multitenant \
        --network multitenant-network \
        --platform linux/amd64 \
        -p 5432:5432 \
        -e POSTGRES_USER=multitenant_user \
        -e POSTGRES_PASSWORD=multitenant_password \
        -e POSTGRES_DB=postgres \
        -v shared_postgres_multitenant_data:/var/lib/postgresql/data \
        postgres:16

    echo "Waiting for database to be ready..."
    for i in {1..30}; do
        if docker exec shared-postgres-multitenant pg_isready -U multitenant_user >/dev/null 2>&1; then
            echo "Shared database container is ready!"
            break
        fi
        echo "   Attempt $i/30 - Database not ready yet..."
        sleep 2
    done
fi

# Run deploy.sh
set +e
./deploy.sh "$TAG" "$ENVIRONMENT"
deploy_exit_code=$?
set -e

if [ $deploy_exit_code -eq 1 ]; then
    echo "Deployment script completed (handling container conflicts...)"

    echo "Starting application container..."
    docker rm -f ${DEPLOY_CONTAINER_PREFIX:-energy}-app 2>/dev/null || true

    if COMPOSE_PROJECT_NAME=energy-multitenant docker compose up -d --no-deps app 2>/dev/null; then
        echo "Started with docker compose"
    elif COMPOSE_PROJECT_NAME=energy-multitenant docker-compose up -d --no-deps app 2>/dev/null; then
        echo "Started with docker-compose (legacy)"
    else
        echo "Docker Compose failed, using direct docker run..."
        docker rm -f ${DEPLOY_CONTAINER_PREFIX:-energy}-app 2>/dev/null || true

        echo "Building fresh image..."
        BUILD_DIR="$HOME/docker-build-energy"
        rm -rf "$BUILD_DIR"
        cp -r "$(pwd)" "$BUILD_DIR"
        docker build -t ${DEPLOY_IMAGE_NAME:-${DEPLOY_CONTAINER_PREFIX:-energy}-app} "$BUILD_DIR"

        ENV_ARGS=""
        if [ -f ".env" ]; then
            while IFS='=' read -r key value; do
                [[ $key =~ ^[[:space:]]*# ]] && continue
                [[ -z "$key" ]] && continue
                value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
                ENV_ARGS="$ENV_ARGS -e $key=$value"
            done < .env
        fi

        docker run -d --name ${DEPLOY_CONTAINER_PREFIX:-energy}-app --network multitenant-network -p 3005:3000 $ENV_ARGS ${DEPLOY_IMAGE_NAME:-${DEPLOY_CONTAINER_PREFIX:-energy}-app}
    fi

    deploy_exit_code=0
fi

if [ $deploy_exit_code -ne 0 ]; then
    echo "Deployment failed with exit code $deploy_exit_code"
    exit $deploy_exit_code
fi

echo ""
echo "Server deployment complete!"
echo "Current release: $CURRENT_LINK -> $DEPLOY_DIR"

# Verify containers are running
echo "Verifying deployment..."
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "${DEPLOY_CONTAINER_PREFIX:-energy}-app.*Up"; then
    echo "Application container is running"
else
    echo "Application container may not be running - checking..."
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(energy|shared-postgres)"
fi

APP_PORT=$(grep "DEPLOY_SITE_PORT" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "3005")
echo "Application should be running on port $APP_PORT"
