#!/bin/bash

# Shared Database Management Script
# This script ensures the shared PostgreSQL container is running
# Copy this script to all industry projects for consistent database management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_DB_COMPOSE="$SCRIPT_DIR/docker-compose.shared-db.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Shared PostgreSQL Database Manager${NC}"
echo

# Check if shared database compose file exists
if [ ! -f "$SHARED_DB_COMPOSE" ]; then
    echo -e "${RED}Error: docker-compose.shared-db.yml not found${NC}"
    echo "Please ensure this file exists in the project root"
    exit 1
fi

# Function to check if container is running
check_container_status() {
    if docker ps --format "table {{.Names}}" | grep -q "shared-postgres-multitenant"; then
        return 0
    else
        return 1
    fi
}

# Function to check if container exists (but might be stopped)
check_container_exists() {
    if docker ps -a --format "table {{.Names}}" | grep -q "shared-postgres-multitenant"; then
        return 0
    else
        return 1
    fi
}

# Function to wait for database to be ready
wait_for_database() {
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker exec shared-postgres-multitenant pg_isready -U multitenant_user >/dev/null 2>&1; then
            echo -e "${GREEN}Database is ready!${NC}"
            return 0
        fi

        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - Database not ready yet...${NC}"
        sleep 2
        ((attempt++))
    done

    echo -e "${RED}Database failed to become ready after $max_attempts attempts${NC}"
    return 1
}

# Main logic
case "${1:-start}" in
    "start"|"up")
        echo -e "${BLUE}Ensuring shared PostgreSQL container is running...${NC}"

        if check_container_status; then
            echo -e "${GREEN}Shared PostgreSQL container is already running${NC}"
        elif check_container_exists; then
            echo -e "${YELLOW}Starting existing shared PostgreSQL container...${NC}"
            docker start shared-postgres-multitenant
            docker compose -f "$SHARED_DB_COMPOSE" up -d --no-recreate shared-postgres
        else
            echo -e "${YELLOW}Creating and starting shared PostgreSQL container...${NC}"
            docker compose -f "$SHARED_DB_COMPOSE" up -d shared-postgres
        fi

        if wait_for_database; then
            echo -e "${GREEN}Shared PostgreSQL is ready for multi-tenant deployments!${NC}"

            echo
            echo -e "${BLUE}Connection Information:${NC}"
            echo -e "   Host: shared-postgres-multitenant"
            echo -e "   Port: 5432"
            echo -e "   User: multitenant_user"
            echo -e "   Default DB: postgres"
            echo
            echo -e "${BLUE}Example DATABASE_URL for energy project:${NC}"
            echo -e "   postgresql://multitenant_user:multitenant_password@localhost:5432/energy"
        else
            exit 1
        fi
        ;;

    "stop"|"down")
        echo -e "${BLUE}Stopping shared PostgreSQL container...${NC}"
        docker compose -f "$SHARED_DB_COMPOSE" stop
        echo -e "${GREEN}Shared PostgreSQL container stopped${NC}"
        ;;

    "restart")
        echo -e "${BLUE}Restarting shared PostgreSQL container...${NC}"
        docker compose -f "$SHARED_DB_COMPOSE" restart
        wait_for_database
        echo -e "${GREEN}Shared PostgreSQL container restarted${NC}"
        ;;

    "logs")
        echo -e "${BLUE}Showing shared PostgreSQL container logs...${NC}"
        docker compose -f "$SHARED_DB_COMPOSE" logs -f shared-postgres
        ;;

    "status")
        echo -e "${BLUE}Checking shared PostgreSQL container status...${NC}"
        if check_container_status; then
            echo -e "${GREEN}Container is running${NC}"
            docker ps --filter "name=shared-postgres-multitenant" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        elif check_container_exists; then
            echo -e "${YELLOW}Container exists but is not running${NC}"
            docker ps -a --filter "name=shared-postgres-multitenant" --format "table {{.Names}}\t{{.Status}}"
        else
            echo -e "${RED}Container does not exist${NC}"
        fi
        ;;

    "remove"|"destroy")
        echo -e "${RED}Removing shared PostgreSQL container and data...${NC}"
        read -p "This will delete all data. Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose -f "$SHARED_DB_COMPOSE" down -v
            echo -e "${GREEN}Shared PostgreSQL container and data removed${NC}"
        else
            echo -e "${YELLOW}Operation cancelled${NC}"
        fi
        ;;

    "help"|"--help"|"-h")
        echo -e "${BLUE}Shared Database Management Commands:${NC}"
        echo
        echo -e "  ${GREEN}start${NC}   (default) - Ensure shared PostgreSQL container is running"
        echo -e "  ${GREEN}stop${NC}             - Stop the shared PostgreSQL container"
        echo -e "  ${GREEN}restart${NC}          - Restart the shared PostgreSQL container"
        echo -e "  ${GREEN}status${NC}           - Check container status"
        echo -e "  ${GREEN}logs${NC}             - Show container logs"
        echo -e "  ${GREEN}remove${NC}           - Remove container and all data (destructive)"
        echo -e "  ${GREEN}help${NC}             - Show this help message"
        echo
        echo -e "${BLUE}Examples:${NC}"
        echo -e "  ./manage-shared-db.sh start"
        echo -e "  ./manage-shared-db.sh status"
        echo -e "  ./manage-shared-db.sh logs"
        ;;

    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo -e "Use '${GREEN}./manage-shared-db.sh help${NC}' for available commands"
        exit 1
        ;;
esac
