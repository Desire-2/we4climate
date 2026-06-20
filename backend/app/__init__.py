import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()


def create_app() -> Flask:
    """Application factory for the We4Climate API."""
    app = Flask(__name__)

    # ------------------------------------------------------------------
    # Configuration
    # ------------------------------------------------------------------
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "dev-secret-change-in-production"
    )

    # Database – prefer PostgreSQL via DATABASE_URL, fallback to SQLite
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
            basedir, "..", "we4climate.db"
        )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # JSON encoding and sorting
    app.config["JSON_SORT_KEYS"] = False

    # ------------------------------------------------------------------
    # Initialize extensions
    # ------------------------------------------------------------------
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ------------------------------------------------------------------
    # Register blueprints
    # ------------------------------------------------------------------
    from app.routes.pledges import pledges_bp
    from app.routes.certificates import certificates_bp
    from app.routes.opportunities import opportunities_bp
    from app.routes.impact import impact_bp
    from app.routes.contact import contact_bp
    from app.routes.admin import admin_bp
    from app.routes.weekly_challenge import weekly_challenge_bp
    from app.routes.webinars import webinar_bp

    app.register_blueprint(pledges_bp, url_prefix="/api/pledges")
    app.register_blueprint(certificates_bp, url_prefix="/api/certificates")
    app.register_blueprint(opportunities_bp, url_prefix="/api/opportunities")
    app.register_blueprint(impact_bp, url_prefix="/api/impact")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(weekly_challenge_bp, url_prefix="/api/weekly-challenge")
    app.register_blueprint(webinar_bp, url_prefix="/api/webinars")

    # ------------------------------------------------------------------
    # Health-check
    # ------------------------------------------------------------------
    @app.route("/api/health")
    def health():
        return {"status": "healthy", "service": "we4climate-api"}

    # ------------------------------------------------------------------
    # Create tables on first request in dev (useful for SQLite)
    # ------------------------------------------------------------------
    with app.app_context():
        from app import models  # noqa: F401 – ensure models are loaded

        db.create_all()

    return app
