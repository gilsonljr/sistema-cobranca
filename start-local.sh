#!/bin/bash

# Sistema de Cobrança - Local Deployment Script
# This script provides easy commands to manage the local deployment

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage information
show_usage() {
  echo -e "${YELLOW}Usage:${NC} $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start       - Start all services"
  echo "  stop        - Stop all services"
  echo "  restart     - Restart all services"
  echo "  status      - Check status of services"
  echo "  logs        - View logs from all services"
  echo "  logs-backend - View logs from backend service only"
  echo "  logs-frontend - View logs from frontend service only"
  echo "  logs-db     - View logs from database service only"
  echo "  rebuild     - Rebuild and restart all services"
  echo "  clean       - Stop services and remove volumes (WARNING: deletes all data)"
  echo ""
}

# Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
  fi
}

# Start services
start_services() {
  echo -e "${GREEN}Starting services...${NC}"
  docker-compose up -d
  echo -e "${GREEN}Services started. Access the application at:${NC}"
  echo -e "  Frontend: ${YELLOW}http://localhost${NC}"
  echo -e "  Backend API: ${YELLOW}http://localhost:8000${NC}"
  echo -e "  API Documentation: ${YELLOW}http://localhost:8000/docs${NC}"
}

# Stop services
stop_services() {
  echo -e "${YELLOW}Stopping services...${NC}"
  docker-compose down
  echo -e "${GREEN}Services stopped.${NC}"
}

# Restart services
restart_services() {
  echo -e "${YELLOW}Restarting services...${NC}"
  docker-compose restart
  echo -e "${GREEN}Services restarted.${NC}"
}

# Check status of services
check_status() {
  echo -e "${YELLOW}Checking status of services...${NC}"
  docker-compose ps
}

# View logs
view_logs() {
  echo -e "${YELLOW}Viewing logs from all services. Press Ctrl+C to exit.${NC}"
  docker-compose logs -f
}

# View backend logs
view_backend_logs() {
  echo -e "${YELLOW}Viewing logs from backend service. Press Ctrl+C to exit.${NC}"
  docker-compose logs -f backend
}

# View frontend logs
view_frontend_logs() {
  echo -e "${YELLOW}Viewing logs from frontend service. Press Ctrl+C to exit.${NC}"
  docker-compose logs -f frontend
}

# View database logs
view_db_logs() {
  echo -e "${YELLOW}Viewing logs from database service. Press Ctrl+C to exit.${NC}"
  docker-compose logs -f db
}

# Rebuild services
rebuild_services() {
  echo -e "${YELLOW}Rebuilding and restarting services...${NC}"
  docker-compose down
  docker-compose up -d --build
  echo -e "${GREEN}Services rebuilt and restarted.${NC}"
}

# Clean everything (including volumes)
clean_everything() {
  echo -e "${RED}WARNING: This will remove all containers, networks, and volumes.${NC}"
  echo -e "${RED}All data will be lost.${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing all containers, networks, and volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}Cleanup complete.${NC}"
  else
    echo -e "${YELLOW}Operation cancelled.${NC}"
  fi
}

# Main script execution
check_docker

# Check if a command was provided
if [ $# -eq 0 ]; then
  show_usage
  exit 0
fi

# Process command
case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    restart_services
    ;;
  status)
    check_status
    ;;
  logs)
    view_logs
    ;;
  logs-backend)
    view_backend_logs
    ;;
  logs-frontend)
    view_frontend_logs
    ;;
  logs-db)
    view_db_logs
    ;;
  rebuild)
    rebuild_services
    ;;
  clean)
    clean_everything
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_usage
    exit 1
    ;;
esac

exit 0
