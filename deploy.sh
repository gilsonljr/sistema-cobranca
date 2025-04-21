#!/bin/bash

# Sistema de Cobrança Inteligente - Deployment Script
# This script deploys the application to production

# Exit on error
set -e

echo "Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Pull latest changes from repository
echo "Pulling latest changes from repository..."
git pull

# Build and start the containers
echo "Building and starting containers..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for the backend to be ready
echo "Waiting for the backend to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose exec backend python -m app.db.init_db

# Check if services are running
echo "Checking if services are running..."
if docker-compose ps | grep -q "Up"; then
    echo "Deployment successful! Services are running."
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:8000"
    echo "API Documentation: http://localhost:8000/docs"
else
    echo "Deployment failed. Please check the logs for more information."
    docker-compose logs
    exit 1
fi
