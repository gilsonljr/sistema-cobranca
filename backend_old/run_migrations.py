import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """Run database migrations using Alembic"""
    logger.info("Running database migrations...")
    
    try:
        # Run Alembic upgrade command
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        logger.info("Database migrations completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running migrations: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()
