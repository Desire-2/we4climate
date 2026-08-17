"""
/api/admin – authentication, dashboard stats, and full CRUD for all models.
"""
import logging
import os
import hashlib
import secrets
from functools import wraps
from datetime import datetime, timezone, timedelta

from marshmallow import ValidationError
from flask import Blueprint, jsonify, request, g

from app import db
from app.models import (
    AdminUser,
    Opportunity,
    Pledge,
    Certificate,
    Application,
    DistrictMetric,
    ContactMessage,
    WeeklyChallenge,
    Webinar,
    ImpactStory,
    YearlyTarget,
    ImpactGoal,
    Volunteer,
)

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

PEPPER = os.environ.get("ADMIN_PEPPER", "we4climate-dev-pepper")
TOKEN_MAX_AGE_DAYS = 30  # tokens expire after 30 days


def _hash_password(password: str) -> str:
    """Return a SHA-256 hex digest with a random salt."""
    salt = secrets.token_hex(16)
    raw = f"{salt}{password}{PEPPER}"
    return f"{salt}${hashlib.sha256(raw.encode()).hexdigest()}"


def _check_password(password: str, stored: str) -> bool:
    try:
        salt, expected = stored.split("$", 1)
        raw = f"{salt}{password}{PEPPER}"
        return hashlib.sha256(raw.encode()).hexdigest() == expected
    except ValueError:
        return False


def _generate_token() -> str:
    return secrets.token_urlsafe(48)


def _cleanup_expired_tokens():
    """Remove tokens older than TOKEN_MAX_AGE_DAYS."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=TOKEN_MAX_AGE_DAYS)
    # Handle both naive and aware datetimes for SQLite/PostgreSQL compatibility
    for admin in AdminUser.query.filter(AdminUser.token.isnot(None)).all():
        created = admin.token_created_at
        if created is None:
            continue
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created < cutoff:
            admin.token = None
            admin.token_created_at = None
    db.session.commit()


def require_admin(f):
    """Decorator - require a valid Bearer token from an admin user."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.removeprefix("Bearer ").strip()
        if not token:
            return jsonify({"error": "Unauthorized"}), 401

        admin = AdminUser.query.filter_by(token=token).first()
        if admin is None:
            return jsonify({"error": "Unauthorized"}), 401

        # Check token expiry
        if admin.token_created_at:
            created = admin.token_created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            age = datetime.now(timezone.utc) - created
            if age > timedelta(days=TOKEN_MAX_AGE_DAYS):
                admin.token = None
                admin.token_created_at = None
                db.session.commit()
                return jsonify({"error": "Token expired"}), 401

        g.admin_user = admin
        return f(*args, **kwargs)

    return wrapper


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------


@admin_bp.route("/login", methods=["POST"])
def login():
    """Authenticate an admin user and return a token."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    admin = AdminUser.query.filter_by(username=username).first()
    if not admin or not _check_password(password, admin.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    # Invalidate any previous token for this admin
    admin.token = _generate_token()
    admin.token_created_at = datetime.now(timezone.utc)
    db.session.commit()

    # Periodically clean up expired tokens
    try:
        _cleanup_expired_tokens()
    except Exception:
        logger.warning("Token cleanup failed", exc_info=True)

    return jsonify({"token": admin.token, "admin": admin.to_dict()}), 200


@admin_bp.route("/verify", methods=["GET"])
@require_admin
def verify_token():
    """Verify a token is still valid."""
    return jsonify({"valid": True, "admin": g.admin_user.to_dict()}), 200


@admin_bp.route("/logout", methods=["POST"])
@require_admin
def logout():
    """Invalidate the current token."""
    g.admin_user.token = None
    g.admin_user.token_created_at = None
    db.session.commit()
    return jsonify({"message": "Logged out"}), 200


# ---------------------------------------------------------------------------
# Manage Webinars
# ---------------------------------------------------------------------------


@admin_bp.route("/webinars", methods=["GET"])
@require_admin
def list_webinars_admin():
    rows = Webinar.query.order_by(Webinar.date.asc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/webinars", methods=["POST"])
@require_admin
def create_webinar_admin():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import WebinarRequestSchema
    schema = WebinarRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        webinar = Webinar(
            title=validated["title"],
            speaker=validated["speaker"],
            speaker_title=validated.get("speaker_title"),
            date=validated["date"],
            time=validated["time"],
            description=validated["description"],
            max_capacity=validated.get("max_capacity"),
            is_active=validated.get("is_active", True),
        )
        db.session.add(webinar)
        db.session.commit()
        return jsonify(webinar.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/webinars/<int:webinar_id>", methods=["PUT"])
@require_admin
def update_webinar_admin(webinar_id):
    webinar = db.session.get(Webinar, webinar_id)
    if not webinar:
        return jsonify({"error": "Webinar not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import WebinarRequestSchema
    schema = WebinarRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        webinar.title = validated.get("title", webinar.title)
        webinar.speaker = validated.get("speaker", webinar.speaker)
        webinar.speaker_title = validated.get("speaker_title", webinar.speaker_title)
        webinar.date = validated.get("date", webinar.date)
        webinar.time = validated.get("time", webinar.time)
        webinar.description = validated.get("description", webinar.description)
        webinar.max_capacity = validated.get("max_capacity", webinar.max_capacity)
        webinar.is_active = validated.get("is_active", webinar.is_active)
        db.session.commit()
        return jsonify(webinar.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update webinar %s", webinar_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/webinars/<int:webinar_id>", methods=["DELETE"])
@require_admin
def delete_webinar_admin(webinar_id):
    webinar = db.session.get(Webinar, webinar_id)
    if not webinar:
        return jsonify({"error": "Webinar not found"}), 404
    try:
        db.session.delete(webinar)
        db.session.commit()
        return jsonify({"message": "Webinar deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Weekly Challenges
# ---------------------------------------------------------------------------


@admin_bp.route("/weekly-challenges", methods=["GET"])
@require_admin
def list_weekly_challenges():
    rows = WeeklyChallenge.query.order_by(WeeklyChallenge.created_at.desc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/weekly-challenges", methods=["POST"])
@require_admin
def create_weekly_challenge():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import WeeklyChallengeRequestSchema
    schema = WeeklyChallengeRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        # If this challenge is marked active, deactivate all others first
        if validated.get("is_active"):
            WeeklyChallenge.query.filter_by(is_active=True).update(
                {"is_active": False}
            )

        challenge = WeeklyChallenge(
            title=validated["title"],
            week_start=validated["week_start"],
            week_end=validated["week_end"],
            questions=validated["questions"],
            is_active=validated.get("is_active", False),
        )
        db.session.add(challenge)
        db.session.commit()
        return jsonify(challenge.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/weekly-challenges/<int:challenge_id>", methods=["PUT"])
@require_admin
def update_weekly_challenge(challenge_id):
    challenge = db.session.get(WeeklyChallenge, challenge_id)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import WeeklyChallengeRequestSchema
    schema = WeeklyChallengeRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        if validated.get("is_active"):
            WeeklyChallenge.query.filter(
                WeeklyChallenge.id != challenge_id
            ).filter_by(is_active=True).update({"is_active": False})

        challenge.title = validated.get("title", challenge.title)
        challenge.week_start = validated.get("week_start", challenge.week_start)
        challenge.week_end = validated.get("week_end", challenge.week_end)
        challenge.questions = validated.get("questions", challenge.questions)
        challenge.is_active = validated.get("is_active", challenge.is_active)
        db.session.commit()
        return jsonify(challenge.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update weekly challenge %s", challenge_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/weekly-challenges/<int:challenge_id>", methods=["DELETE"])
@require_admin
def delete_weekly_challenge(challenge_id):
    challenge = db.session.get(WeeklyChallenge, challenge_id)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404
    try:
        db.session.delete(challenge)
        db.session.commit()
        return jsonify({"message": "Challenge deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Seed default admin (run from shell)
# ---------------------------------------------------------------------------


def seed_admin(username: str = "admin", password: str = "admin123"):
    """Create the default admin user if none exists."""
    existing = AdminUser.query.filter_by(username=username).first()
    if existing:
        print(f"Admin user '{username}' already exists.")
        return
    admin = AdminUser(username=username, password_hash=_hash_password(password))
    db.session.add(admin)
    db.session.commit()
    print(f"Admin user '{username}' created.")


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------


@admin_bp.route("/stats", methods=["GET"])
@require_admin
def dashboard_stats():
    """Return aggregate counts for the admin dashboard."""
    try:
        pledges = Pledge.query.count()
        certificates = Certificate.query.count()
        applications = Application.query.count()
        contacts = ContactMessage.query.count()
        districts = DistrictMetric.query.count()
        opportunities = Opportunity.query.count()
        volunteers_count = Volunteer.query.count()
        total_trees = db.session.query(db.func.sum(DistrictMetric.trees_planted)).scalar() or 0

        return jsonify({
            "total_pledges": pledges,
            "total_certificates": certificates,
            "total_applications": applications,
            "total_contacts": contacts,
            "total_districts": districts,
            "total_opportunities": opportunities,
            "total_stories": ImpactStory.query.count(),
            "total_webinars": Webinar.query.count(),
            "total_trees_planted": total_trees,
            "total_volunteers": volunteers_count,
        }), 200
    except Exception as exc:
        logger.exception("Failed to compute dashboard stats")
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Opportunities
# ---------------------------------------------------------------------------


@admin_bp.route("/opportunities", methods=["GET"])
@require_admin
def list_opportunities_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    status = (request.args.get("status") or "").strip().lower()

    q = Opportunity.query
    if status == "active":
        q = q.filter_by(is_active=True)
    elif status == "inactive":
        q = q.filter_by(is_active=False)

    active_count = Opportunity.query.filter_by(is_active=True).count()
    inactive_count = Opportunity.query.filter_by(is_active=False).count()

    pag = q.order_by(Opportunity.created_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [o.to_dict() for o in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
        "active_count": active_count,
        "inactive_count": inactive_count,
    }), 200


@admin_bp.route("/opportunities", methods=["POST"])
@require_admin
def create_opportunity():
    from app.schemas import OpportunityRequestSchema  # noqa: keep local to avoid import ordering issue
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400
    schema = OpportunityRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        opp = Opportunity(
            title=validated["title"],
            type=validated["type"],
            location=validated["location"],
            deadline=validated.get("deadline"),
            description=validated["description"],
            requirements=validated.get("requirements", []),
            is_external=validated.get("is_external", False),
            external_url=validated.get("external_url"),
            is_active=validated.get("is_active", True),
        )
        db.session.add(opp)
        db.session.commit()
        return jsonify(opp.to_dict()), 201
    except Exception as exc:
        logger.exception("Failed to create opportunity")
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/opportunities/<int:opp_id>", methods=["PUT"])
@require_admin
def update_opportunity(opp_id):
    from app.schemas import OpportunityRequestSchema
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"error": "Opportunity not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400
    schema = OpportunityRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        opp.title = validated.get("title", opp.title)
        opp.type = validated.get("type", opp.type)
        opp.location = validated.get("location", opp.location)
        opp.deadline = validated.get("deadline", opp.deadline)
        opp.description = validated.get("description", opp.description)
        opp.requirements = validated.get("requirements", opp.requirements)
        opp.is_external = validated.get("is_external", opp.is_external)
        opp.external_url = validated.get("external_url", opp.external_url)
        opp.is_active = validated.get("is_active", opp.is_active)
        db.session.commit()
        return jsonify(opp.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/opportunities/<int:opp_id>", methods=["DELETE"])
@require_admin
def delete_opportunity(opp_id):
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"error": "Opportunity not found"}), 404
    try:
        db.session.delete(opp)
        db.session.commit()
        return jsonify({"message": "Opportunity deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Pledges
# ---------------------------------------------------------------------------


@admin_bp.route("/pledges", methods=["GET"])
@require_admin
def list_pledges_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    pag = Pledge.query.order_by(Pledge.timestamp.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [p.to_dict() for p in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
    }), 200


@admin_bp.route("/pledges/<int:pledge_id>", methods=["DELETE"])
@require_admin
def delete_pledge(pledge_id):
    pledge = db.session.get(Pledge, pledge_id)
    if not pledge:
        return jsonify({"error": "Pledge not found"}), 404
    try:
        db.session.delete(pledge)
        db.session.commit()
        return jsonify({"message": "Pledge deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Certificates
# ---------------------------------------------------------------------------


@admin_bp.route("/certificates", methods=["GET"])
@require_admin
def list_certificates_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    search = (request.args.get("search") or "").strip()

    q = Certificate.query
    if search:
        safe_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        like = f"%{safe_search}%"
        q = q.filter(
            db.or_(
                Certificate.recipient_name.ilike(like, escape="\\"),
                Certificate.recipient_email.ilike(like, escape="\\"),
                Certificate.certificate_code.ilike(like, escape="\\"),
            )
        )
    pag = q.order_by(Certificate.issued_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [c.to_dict() for c in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
    }), 200


@admin_bp.route("/certificates/stats", methods=["GET"])
@require_admin
def certificate_stats():
    """Return aggregate stats about issued certificates."""
    total = Certificate.query.count()
    perfect_scores = Certificate.query.filter_by(score=3).count()
    # Score distribution
    dist = (
        db.session.query(Certificate.score, db.func.count(Certificate.id))
        .group_by(Certificate.score)
        .all()
    )
    score_distribution = {str(score): count for score, count in dist}
    return jsonify({
        "total": total,
        "perfect_scores": perfect_scores,
        "score_distribution": score_distribution,
    }), 200


@admin_bp.route("/certificates/<int:cert_id>", methods=["GET"])
@require_admin
def get_certificate(cert_id):
    cert = db.session.get(Certificate, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    return jsonify(cert.to_dict()), 200


@admin_bp.route("/certificates", methods=["POST"])
@require_admin
def create_certificate_admin():
    """Manually issue a certificate from the admin panel."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import CertificateRequestSchema
    schema = CertificateRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        cert = Certificate(
            recipient_name=validated["recipient_name"],
            recipient_email=validated["recipient_email"],
            score=validated["score"],
        )
        db.session.add(cert)
        db.session.commit()
        return jsonify(cert.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/certificates/<int:cert_id>", methods=["PUT"])
@require_admin
def update_certificate(cert_id):
    """Update certificate recipient details."""
    cert = db.session.get(Certificate, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import CertificateRequestSchema
    schema = CertificateRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        cert.recipient_name = validated.get("recipient_name", cert.recipient_name)
        cert.recipient_email = validated.get("recipient_email", cert.recipient_email)
        cert.score = validated.get("score", cert.score)
        db.session.commit()
        return jsonify(cert.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update certificate %s", cert_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/certificates/<int:cert_id>", methods=["DELETE"])
@require_admin
def delete_certificate(cert_id):
    cert = db.session.get(Certificate, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    try:
        db.session.delete(cert)
        db.session.commit()
        return jsonify({"message": "Certificate deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Applications
# ---------------------------------------------------------------------------

VALID_APP_STATUSES = {"pending", "reviewed", "shortlisted", "accepted", "rejected"}


@admin_bp.route("/applications", methods=["GET"])
@require_admin
def list_applications_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    status_filter = (request.args.get("status") or "").strip().lower()
    opp_filter = (request.args.get("opportunity_id") or "").strip()
    search = (request.args.get("search") or "").strip()

    q = Application.query

    if status_filter and status_filter in VALID_APP_STATUSES:
        q = q.filter(Application.status == status_filter)
    if opp_filter:
        q = q.filter(Application.opportunity_id == opp_filter)
    if search:
        safe_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        like = f"%{safe_search}%"
        q = q.filter(
            db.or_(
                Application.applicant_name.ilike(like, escape="\\"),
                Application.applicant_email.ilike(like, escape="\\"),
            )
        )

    total_filtered = q.count()
    status_counts = {}
    base_q = Application.query
    if opp_filter:
        base_q = base_q.filter(Application.opportunity_id == opp_filter)
    for s in VALID_APP_STATUSES:
        status_counts[s] = base_q.filter(Application.status == s).count()

    pag = q.order_by(Application.submitted_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )

    opp_ids = set()
    for a in pag.items:
        try:
            opp_ids.add(int(a.opportunity_id))
        except (ValueError, TypeError):
            pass
    opp_titles = {}
    if opp_ids:
        opps = Opportunity.query.filter(Opportunity.id.in_(opp_ids)).all()
        opp_titles = {o.id: o.title for o in opps}

    items = []
    for a in pag.items:
        d = a.to_dict()
        d["opportunity_title"] = opp_titles.get(
            int(a.opportunity_id) if a.opportunity_id and a.opportunity_id.isdigit() else -1,
            None,
        )
        items.append(d)

    return jsonify({
        "items": items,
        "total": pag.total,
        "total_filtered": total_filtered,
        "page": pag.page,
        "pages": pag.pages,
        "status_counts": status_counts,
    }), 200


@admin_bp.route("/applications/<int:app_id>", methods=["PATCH"])
@require_admin
def update_application_status(app_id):
    app_rec = db.session.get(Application, app_id)
    if not app_rec:
        return jsonify({"error": "Application not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    try:
        if "status" in data:
            if data["status"] not in VALID_APP_STATUSES:
                return jsonify({"error": f"Invalid status. Valid: {', '.join(sorted(VALID_APP_STATUSES))}"}), 422
            app_rec.status = data["status"]
        if "admin_notes" in data:
            app_rec.admin_notes = data["admin_notes"] or None
        db.session.commit()
        return jsonify(app_rec.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/applications/bulk", methods=["POST"])
@require_admin
def bulk_update_applications():
    """Bulk update status or notes for multiple applications."""
    data = request.get_json(silent=True)
    if not data or "ids" not in data:
        return jsonify({"error": "ids list is required"}), 400

    ids = data["ids"]
    status = data.get("status")
    notes = data.get("admin_notes")

    if not isinstance(ids, list) or not ids:
        return jsonify({"error": "ids must be a non-empty list"}), 422
    if status and status not in VALID_APP_STATUSES:
        return jsonify({"error": f"Invalid status. Valid: {', '.join(sorted(VALID_APP_STATUSES))}"}), 422

    try:
        apps = Application.query.filter(Application.id.in_(ids)).all()
        updated = 0
        for app_rec in apps:
            if status:
                app_rec.status = status
            if notes is not None:
                app_rec.admin_notes = notes or None
            updated += 1
        db.session.commit()
        return jsonify({"message": f"Updated {updated} applications", "updated": updated}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/applications/export", methods=["GET"])
@require_admin
def export_applications_csv():
    """Export applications as CSV."""
    import csv
    import io

    opp_filter = (request.args.get("opportunity_id") or "").strip()
    status_filter = (request.args.get("status") or "").strip().lower()

    q = Application.query
    if opp_filter:
        q = q.filter(Application.opportunity_id == opp_filter)
    if status_filter and status_filter in VALID_APP_STATUSES:
        q = q.filter(Application.status == status_filter)

    apps = q.order_by(Application.submitted_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Opportunity ID", "Applicant Name", "Email", "Status", "Admin Notes", "Resume URL", "Submitted At"])

    for a in apps:
        writer.writerow([
            a.id,
            a.opportunity_id,
            a.applicant_name,
            a.applicant_email,
            a.status,
            a.admin_notes or "",
            a.resume_url or "",
            a.submitted_at.isoformat() if a.submitted_at else "",
        ])

    from flask import Response
    csv_content = output.getvalue()
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications_export.csv"},
    )


@admin_bp.route("/applications/<int:app_id>", methods=["DELETE"])
@require_admin
def delete_application(app_id):
    app_rec = db.session.get(Application, app_id)
    if not app_rec:
        return jsonify({"error": "Application not found"}), 404
    try:
        db.session.delete(app_rec)
        db.session.commit()
        return jsonify({"message": "Application deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage District Metrics (enhanced)
# ---------------------------------------------------------------------------


@admin_bp.route("/districts", methods=["GET"])
@require_admin
def list_districts_admin():
    rows = DistrictMetric.query.order_by(DistrictMetric.district_name).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/districts", methods=["POST"])
@require_admin
def create_district_admin():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import DistrictMetricRequestSchema
    schema = DistrictMetricRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    exists = DistrictMetric.query.filter_by(district_name=validated["district_name"]).first()
    if exists:
        return jsonify({"error": "District already exists"}), 409

    try:
        metric = DistrictMetric(
            district_name=validated["district_name"],
            province=validated["province"],
            province_key=validated["province_key"],
            description=validated.get("description", ""),
            species=validated.get("species", []),
            map_coords_x=validated.get("map_coords_x", 50.0),
            map_coords_y=validated.get("map_coords_y", 50.0),
            trees_planted=validated.get("trees_planted", 0),
            community_members=validated.get("community_members", 0),
            farmers_trained=validated.get("farmers_trained", 0),
            active_sites=validated.get("active_sites", 0),
        )
        db.session.add(metric)
        db.session.commit()
        return jsonify(metric.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to create district")
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/districts/<int:district_id>", methods=["PUT"])
@require_admin
def update_district(district_id):
    metric = db.session.get(DistrictMetric, district_id)
    if not metric:
        return jsonify({"error": "District not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import DistrictMetricRequestSchema
    schema = DistrictMetricRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        metric.district_name = validated.get("district_name", metric.district_name)
        metric.province = validated.get("province", metric.province)
        metric.province_key = validated.get("province_key", metric.province_key)
        metric.description = validated.get("description", metric.description)
        metric.species = validated.get("species", metric.species)
        metric.map_coords_x = validated.get("map_coords_x", metric.map_coords_x)
        metric.map_coords_y = validated.get("map_coords_y", metric.map_coords_y)
        metric.trees_planted = validated.get("trees_planted", metric.trees_planted)
        metric.community_members = validated.get("community_members", metric.community_members)
        metric.farmers_trained = validated.get("farmers_trained", metric.farmers_trained)
        metric.active_sites = validated.get("active_sites", metric.active_sites)
        db.session.commit()
        return jsonify(metric.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update district %s", district_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/districts/<int:district_id>", methods=["DELETE"])
@require_admin
def delete_district(district_id):
    metric = db.session.get(DistrictMetric, district_id)
    if not metric:
        return jsonify({"error": "District not found"}), 404
    try:
        db.session.delete(metric)
        db.session.commit()
        return jsonify({"message": "District deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Yearly Targets
# ---------------------------------------------------------------------------


@admin_bp.route("/yearly-targets", methods=["GET"])
@require_admin
def list_yearly_targets_admin():
    rows = YearlyTarget.query.order_by(YearlyTarget.year.asc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/yearly-targets", methods=["POST"])
@require_admin
def create_yearly_target_admin():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import YearlyTargetRequestSchema
    schema = YearlyTargetRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    # Check for duplicate year
    exists = YearlyTarget.query.filter_by(year=validated["year"]).first()
    if exists:
        return jsonify({"error": f"Target for year {validated['year']} already exists"}), 409

    try:
        target = YearlyTarget(
            year=validated["year"],
            trees_target=validated.get("trees_target", 0),
            members_target=validated.get("members_target", 0),
            farmers_target=validated.get("farmers_target", 0),
            sites_target=validated.get("sites_target", 0),
        )
        db.session.add(target)
        db.session.commit()
        return jsonify(target.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/yearly-targets/<int:target_id>", methods=["PUT"])
@require_admin
def update_yearly_target_admin(target_id):
    target = db.session.get(YearlyTarget, target_id)
    if not target:
        return jsonify({"error": "Yearly target not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import YearlyTargetRequestSchema
    schema = YearlyTargetRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    # Check for duplicate year if year is being changed
    new_year = validated.get("year")
    if new_year and new_year != target.year:
        existing = YearlyTarget.query.filter_by(year=new_year).first()
        if existing:
            return jsonify({"error": f"Target for year {new_year} already exists"}), 409

    try:
        target.year = validated.get("year", target.year)
        target.trees_target = validated.get("trees_target", target.trees_target)
        target.members_target = validated.get("members_target", target.members_target)
        target.farmers_target = validated.get("farmers_target", target.farmers_target)
        target.sites_target = validated.get("sites_target", target.sites_target)
        db.session.commit()
        return jsonify(target.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update yearly target %s", target_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/yearly-targets/<int:target_id>", methods=["DELETE"])
@require_admin
def delete_yearly_target_admin(target_id):
    target = db.session.get(YearlyTarget, target_id)
    if not target:
        return jsonify({"error": "Yearly target not found"}), 404
    try:
        db.session.delete(target)
        db.session.commit()
        return jsonify({"message": "Yearly target deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Impact Goals
# ---------------------------------------------------------------------------


@admin_bp.route("/goals", methods=["GET"])
@require_admin
def list_goals_admin():
    rows = ImpactGoal.query.order_by(ImpactGoal.sort_order.asc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/goals", methods=["POST"])
@require_admin
def create_goal_admin():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import ImpactGoalRequestSchema
    schema = ImpactGoalRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        goal = ImpactGoal(
            title=validated["title"],
            description=validated["description"],
            icon=validated.get("icon", "Sparkles"),
            milestone=validated["milestone"],
            action_details=validated.get("action_details", ""),
            sort_order=validated.get("sort_order", 0),
            is_active=validated.get("is_active", True),
        )
        db.session.add(goal)
        db.session.commit()
        return jsonify(goal.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/goals/<int:goal_id>", methods=["PUT"])
@require_admin
def update_goal_admin(goal_id):
    goal = db.session.get(ImpactGoal, goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import ImpactGoalRequestSchema
    schema = ImpactGoalRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        goal.title = validated.get("title", goal.title)
        goal.description = validated.get("description", goal.description)
        goal.icon = validated.get("icon", goal.icon)
        goal.milestone = validated.get("milestone", goal.milestone)
        goal.action_details = validated.get("action_details", goal.action_details)
        goal.sort_order = validated.get("sort_order", goal.sort_order)
        goal.is_active = validated.get("is_active", goal.is_active)
        db.session.commit()
        return jsonify(goal.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update goal %s", goal_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/goals/<int:goal_id>", methods=["DELETE"])
@require_admin
def delete_goal_admin(goal_id):
    goal = db.session.get(ImpactGoal, goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    try:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"message": "Goal deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Impact Stories
# ---------------------------------------------------------------------------


@admin_bp.route("/stories", methods=["GET"])
@require_admin
def list_stories_admin():
    rows = ImpactStory.query.order_by(ImpactStory.sort_order.asc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@admin_bp.route("/stories", methods=["POST"])
@require_admin
def create_story_admin():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import ImpactStoryRequestSchema
    schema = ImpactStoryRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        story = ImpactStory(
            name=validated["name"],
            title=validated["title"],
            quote=validated["quote"],
            initials=validated.get("initials") or validated["name"][:2].upper(),
            district_name=validated.get("district_name", ""),
            is_active=validated.get("is_active", True),
            sort_order=validated.get("sort_order", 0),
        )
        db.session.add(story)
        db.session.commit()
        return jsonify(story.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/stories/<int:story_id>", methods=["PUT"])
@require_admin
def update_story_admin(story_id):
    story = db.session.get(ImpactStory, story_id)
    if not story:
        return jsonify({"error": "Story not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import ImpactStoryRequestSchema
    schema = ImpactStoryRequestSchema(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        story.name = validated.get("name", story.name)
        story.title = validated.get("title", story.title)
        story.quote = validated.get("quote", story.quote)
        story.initials = validated.get("initials", story.initials) or story.name[:2].upper()
        story.district_name = validated.get("district_name", story.district_name)
        story.is_active = validated.get("is_active", story.is_active)
        story.sort_order = validated.get("sort_order", story.sort_order)
        db.session.commit()
        return jsonify(story.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update story %s", story_id)
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/stories/<int:story_id>", methods=["DELETE"])
@require_admin
def delete_story_admin(story_id):
    story = db.session.get(ImpactStory, story_id)
    if not story:
        return jsonify({"error": "Story not found"}), 404
    try:
        db.session.delete(story)
        db.session.commit()
        return jsonify({"message": "Story deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Contact Messages
# ---------------------------------------------------------------------------


@admin_bp.route("/contacts", methods=["GET"])
@require_admin
def list_contacts_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    pag = ContactMessage.query.order_by(ContactMessage.submitted_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [c.to_dict() for c in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
    }), 200


@admin_bp.route("/contacts/<int:contact_id>", methods=["DELETE"])
@require_admin
def delete_contact(contact_id):
    msg = db.session.get(ContactMessage, contact_id)
    if not msg:
        return jsonify({"error": "Contact message not found"}), 404
    try:
        db.session.delete(msg)
        db.session.commit()
        return jsonify({"message": "Contact message deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Profile Management
# ---------------------------------------------------------------------------


@admin_bp.route("/profile", methods=["GET"])
@require_admin
def get_profile():
    """Return the current admin user's profile."""
    return jsonify(g.admin_user.to_dict()), 200


@admin_bp.route("/profile", methods=["PUT"])
@require_admin
def update_profile():
    """Update the current admin user's username."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    new_username = (data.get("username") or "").strip()
    if not new_username:
        return jsonify({"error": "Username is required"}), 400
    if len(new_username) < 3 or len(new_username) > 80:
        return jsonify({"error": "Username must be between 3 and 80 characters"}), 422

    # Check if username is already taken by another admin
    existing = AdminUser.query.filter(
        AdminUser.username == new_username,
        AdminUser.id != g.admin_user.id,
    ).first()
    if existing:
        return jsonify({"error": "Username is already taken"}), 409

    try:
        g.admin_user.username = new_username
        db.session.commit()
        return jsonify(g.admin_user.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update profile")
        return jsonify({"error": str(exc)}), 500


@admin_bp.route("/password", methods=["PUT"])
@require_admin
def change_password():
    """Change the current admin user's password."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not current_password:
        return jsonify({"error": "Current password is required"}), 400
    if not new_password:
        return jsonify({"error": "New password is required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 422

    if not _check_password(current_password, g.admin_user.password_hash):
        return jsonify({"error": "Current password is incorrect"}), 403

    try:
        g.admin_user.password_hash = _hash_password(new_password)
        # Invalidate all sessions for this admin (clear their token)
        g.admin_user.token = None
        g.admin_user.token_created_at = None
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to change password")
        return jsonify({"error": str(exc)}), 500
