import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_tests():
    """Run tests using pytest"""
    logger.info("Running tests...")
    
    try:
        # Run pytest with coverage
        subprocess.run(["pytest", "-v"], check=True)
        logger.info("Tests completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running tests: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
