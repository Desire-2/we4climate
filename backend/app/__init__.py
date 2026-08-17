import os
import atexit
import logging
from threading import Thread, Event

from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

logger = logging.getLogger(__name__)

db = SQLAlchemy()
migrate = Migrate()


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
        # Normalise the legacy Heroku/Aiven "postgres://" prefix to "postgresql://"
        if database_url.startswith("postgres://"):
            database_url = "postgresql://" + database_url[len("postgres://"):]
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
            basedir, "..", "we4climate.db"
        )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # JSON encoding and sorting
    app.config["JSON_SORT_KEYS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024
    app.config["UPLOAD_FOLDER"] = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "uploads", "applications")
    )
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ------------------------------------------------------------------
    # Initialize extensions
    # ------------------------------------------------------------------
    db.init_app(app)
    migrate.init_app(app, db)
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
    from app.routes.volunteers import volunteers_bp

    app.register_blueprint(pledges_bp, url_prefix="/api/pledges")
    app.register_blueprint(certificates_bp, url_prefix="/api/certificates")
    app.register_blueprint(opportunities_bp, url_prefix="/api/opportunities")
    app.register_blueprint(impact_bp, url_prefix="/api/impact")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(weekly_challenge_bp, url_prefix="/api/weekly-challenge")
    app.register_blueprint(webinar_bp, url_prefix="/api/webinars")
    app.register_blueprint(volunteers_bp, url_prefix="/api/volunteers")

    # ------------------------------------------------------------------
    # Health-check
    # ------------------------------------------------------------------
    @app.route("/api/health")
    def health():
        return {"status": "healthy", "service": "we4climate-api"}

    @app.route("/uploads/applications/<path:filename>")
    def uploaded_application_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # ------------------------------------------------------------------
    # Ensure models are imported and tables exist (needed for SQLite dev fallback)
    # ------------------------------------------------------------------
    with app.app_context():
        from app import models  # noqa: F401
        if app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite"):
            db.create_all()
        _seed_default_opportunities()
        _seed_default_webinars()

    _start_keep_alive_worker(app)

    return app


# ------------------------------------------------------------------
# Background DB keep-alive worker
# ------------------------------------------------------------------

_shutdown_event = Event()


def _db_keep_alive(app: Flask):
    """Ping the database every 300 seconds to prevent idle shutdown."""
    import time

    _shutdown_event.wait(300)  # initial delay before first ping

    while not _shutdown_event.is_set():
        try:
            with app.app_context():
                db.session.execute(db.text("SELECT 1"))
                db.session.commit()
            logger.info("DB keep-alive ping succeeded")
        except Exception:
            logger.exception("DB keep-alive ping failed")
        _shutdown_event.wait(300)


def _start_keep_alive_worker(app: Flask):
    """Start the background keep-alive thread (non-daemon so it dies with the process)."""
    thread = Thread(target=_db_keep_alive, args=(app,), daemon=True, name="db-keep-alive")
    thread.start()
    logger.info("DB keep-alive worker started")
    atexit.register(lambda: _shutdown_event.set())


def _seed_default_opportunities():
    """Insert default opportunities if the table is empty."""
    from app.models import Opportunity
    if Opportunity.query.count() > 0:
        return
    defaults = [
        {
            "title": "Forestry & Agroforestry Field Assistant",
            "type": "Internship",
            "location": "Musanze (Northern Province)",
            "deadline": "June 30, 2026",
            "description": "Collaborate directly with senior local foresters and support community-led tree planting coordinates.",
            "requirements": ["Enrolled in Environment, Forestry, or Agronomy", "Based in or able to relocate to Musanze", "Passion for soil and ecosystem restoration"],
        },
        {
            "title": "District Environmental Club Coordinator",
            "type": "Volunteer",
            "location": "Bugesera & Kayonza",
            "deadline": "July 05, 2026",
            "description": "Empower primary and secondary school student units. Set up interactive nature tables and plant school orchards.",
            "requirements": ["Exceptional team leadership skills", "Comfortable organizing district learning seminars", "Available at least 8 hours a week"],
        },
        {
            "title": "Urban Wetland Advocacy Officer",
            "type": "Job",
            "location": "Kigali (Kicukiro HQ)",
            "deadline": "July 15, 2026",
            "description": "Manage campaigns raising urban biodiversity awareness around Kigali's major valleys and restored parks.",
            "requirements": ["Bachelor's in Environmental Science or PR", "Fluent in English and Kinyarwanda", "Proven history of running ecological campaigns"],
        },
        {
            "title": "Nature-Based Solutions Development Leader",
            "type": "Job",
            "location": "Kigali (Kicukiro HQ)",
            "deadline": "July 28, 2026",
            "description": "Design technical models for community soil restoration and hillside binding across Rwanda.",
            "requirements": ["2+ years in biodiversity conservation or NBS", "Understanding of CBD and Paris Agreement targets", "Passionate trainer for intergenerational equity"],
        },
    ]
    for d in defaults:
        db.session.add(Opportunity(**d))
    db.session.commit()


def _seed_default_webinars():
    """Insert default webinars if the table is empty."""
    from app.models import Webinar
    if Webinar.query.count() > 0:
        return
    defaults = [
        {
            "title": "Intergenerational Action: Community Dialogue with Elder Experts",
            "speaker": "Dr. Jean d'Amour",
            "speaker_title": "REMA & We4Climate Delegates",
            "date": "June 25, 2026",
            "time": "2:00 PM - 4:00 PM CAT",
            "description": "Establishing vital knowledge channels between seasoned conservation guardians and active community members.",
            "max_capacity": 100,
        },
        {
            "title": "Radical Terracing and Nature-Based Hillside Solutions",
            "speaker": "Umuhoza Sonia",
            "speaker_title": "Ecosystem Integrity Lead",
            "date": "July 12, 2026",
            "time": "10:30 AM - 12:00 PM CAT",
            "description": "Practical methods for land degradation prevention, agroforestry integration, and hillside binding.",
            "max_capacity": 80,
        },
    ]
    for d in defaults:
        db.session.add(Webinar(**d))
    db.session.commit()
