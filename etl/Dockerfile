# InvestOre Analytics - ETL Dockerfile
# Prefect worker for data pipelines

FROM riotinto-docker.artifactory.riotinto.com/python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN groupadd -r etl && useradd -r -g etl etl
RUN chown -R etl:etl /app
USER etl

# Default command - can be overridden
CMD ["python", "-m", "prefect", "worker", "start", "--pool", "investore-etl-pool"]
