#!/usr/bin/env bash
# =============================================================================
# We4Climate API – Startup Script
# =============================================================================
# Runs database migrations and then starts the Gunicorn WSGI server.
# This is the CMD entrypoint for the Docker container.
#
# Environment variables (set in Render dashboard):
#   DATABASE_URL   – PostgreSQL connection string (required)
#   SECRET_KEY     – Flask secret key (required)
#   PORT           – Port to bind (default: 5000)
#   GUNICORN_WORKERS – Number of Gunicorn worker processes (default: 4)
# =============================================================================

set -e  # Exit immediately on any error

# ── Run database migrations ────────────────────────────────────────────────
echo "→ Running database migrations..."
flask db upgrade
echo "✓ Migrations complete."

# ── Start Gunicorn ─────────────────────────────────────────────────────────
PORT="${PORT:-5000}"
WORKERS="${GUNICORN_WORKERS:-4}"

echo "→ Starting Gunicorn on 0.0.0.0:${PORT} with ${WORKERS} workers..."

exec gunicorn --bind "0.0.0.0:${PORT}" \
    --workers "${WORKERS}" \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    "app:create_app()"
