FROM python:3.9-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create prestart script
RUN echo '#!/bin/bash\n\
echo "Running database migrations..."\n\
python -m app.db.init_db\n\
exec "$@"' > /app/prestart.sh \
    && chmod +x /app/prestart.sh

# Expose port
EXPOSE 8000

# Set the entrypoint
ENTRYPOINT ["/app/prestart.sh"]

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]