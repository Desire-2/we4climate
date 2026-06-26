# =============================================================================
# We4Climate API – Dockerfile (for Render / production deployment)
# =============================================================================
FROM python:3.11-slim

# ── Python runtime settings ─────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app

# ── Working directory ───────────────────────────────────────────────────────
WORKDIR /app

# ── Create a non-root user for security ─────────────────────────────────────
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --gid 1001 appuser

# ── Install system dependencies (psycopg2 needs libpq) ──────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python dependencies (layer caching) ─────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application code ───────────────────────────────────────────────────
COPY . .

# ── Make startup script executable ──────────────────────────────────────────
RUN chmod +x /app/start.sh

# ── Ensure proper ownership ─────────────────────────────────────────────────
RUN chown -R appuser:appgroup /app

# ── Switch to non-root user ─────────────────────────────────────────────────
USER appuser

# ── Expose the port (Render injects PORT env variable) ──────────────────────
EXPOSE 5000

# ── Health check ────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import os; import urllib.request; port = os.environ.get('PORT', '5000'); urllib.request.urlopen(f'http://localhost:{port}/api/health')"

# ── Start with Gunicorn via the startup script ──────────────────────────────
# The startup script runs database migrations before starting Gunicorn
CMD ["/app/start.sh"]
