# Sistema de Cobrança - Local Deployment Guide

This guide provides detailed instructions for deploying and managing the Sistema de Cobrança application on your local machine.

## Prerequisites

- Docker installed
- Docker Compose installed
- Git (if cloning from repository)

## Quick Start

1. Start the application:
   ```bash
   ./start-local.sh start
   ```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. Stop the application:
   ```bash
   ./start-local.sh stop
   ```

## Default Users

The application comes with the following default users:

| Role       | Email                   | Password      |
|------------|-------------------------|---------------|
| Admin      | admin@sistema.com       | admin123      |
| Supervisor | supervisor@sistema.com  | supervisor123 |
| Collector  | operador@sistema.com    | operador123   |
| Seller     | vendedor@sistema.com    | vendedor123   |

## Managing the Application

The `start-local.sh` script provides several commands to manage the application:

```bash
./start-local.sh [command]
```

Available commands:

- `start` - Start all services
- `stop` - Stop all services
- `restart` - Restart all services
- `status` - Check status of services
- `logs` - View logs from all services
- `logs-backend` - View logs from backend service only
- `logs-frontend` - View logs from frontend service only
- `logs-db` - View logs from database service only
- `rebuild` - Rebuild and restart all services
- `clean` - Stop services and remove volumes (WARNING: deletes all data)

## Configuration

The application is configured using environment variables in the `docker-compose.yml` file. The most important settings are:

- `REACT_APP_MOCK_API=true` - Enables mock mode for the frontend (no real backend API calls)
- `POSTGRES_PASSWORD=postgres` - Database password
- `SECRET_KEY=your-secret-key-here-change-in-production` - Secret key for JWT tokens

## Data Persistence

The application uses Docker volumes to persist data:

- `postgres_data` - Stores the PostgreSQL database data

To completely reset the application data, use:

```bash
./start-local.sh clean
```

## Troubleshooting

### Login Issues

If you encounter login issues:

1. Make sure the `REACT_APP_MOCK_API` environment variable is set to `true` in `docker-compose.yml`
2. Restart the application with `./start-local.sh restart`
3. Clear your browser cache and cookies
4. Try using the test login page at http://localhost/test-login

### Container Issues

If containers fail to start:

1. Check the logs with `./start-local.sh logs`
2. Ensure no other services are using ports 80, 8000, or 5432
3. Try rebuilding the containers with `./start-local.sh rebuild`

### Database Issues

If the database fails to initialize:

1. Check the database logs with `./start-local.sh logs-db`
2. Try cleaning and restarting with `./start-local.sh clean` followed by `./start-local.sh start`

## Advanced Usage

### Accessing the Database

To connect to the PostgreSQL database directly:

```bash
docker-compose exec db psql -U postgres -d billing_system
```

### Running Backend Commands

To run commands in the backend container:

```bash
docker-compose exec backend python -m [command]
```

Example:

```bash
docker-compose exec backend python -m app.db.create_tables
```

### Viewing Backend API Documentation

The backend API documentation is available at:

```
http://localhost:8000/docs
```

This interactive documentation allows you to test API endpoints directly from your browser.

## Security Notes

This configuration is intended for local development only. For production deployment:

1. Change all default passwords
2. Use proper SSL/TLS certificates
3. Set `REACT_APP_MOCK_API=false` to use the real backend API
4. Configure proper CORS settings
5. Use a proper secret key for JWT tokens
