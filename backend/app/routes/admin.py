"""
/api/admin – authentication, dashboard stats, and full CRUD for all models.
"""
import os
import traceback
import hashlib
import secrets
from functools import wraps
from datetime import datetime, timezone

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
)

admin_bp = Blueprint("admin", __name__)

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

PEPPER = os.environ.get("ADMIN_PEPPER", "we4climate-dev-pepper")


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


TOKENS: dict[str, int] = {}  # token -> admin_user_id


def _generate_token() -> str:
    return secrets.token_urlsafe(48)


def require_admin(f):
    """Decorator – require a valid Bearer token from an admin user."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.removeprefix("Bearer ").strip()
        admin_id = TOKENS.get(token)
        if admin_id is None:
            return jsonify({"error": "Unauthorized"}), 401
        admin = db.session.get(AdminUser, admin_id)
        if admin is None:
            return jsonify({"error": "Unauthorized"}), 401
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

    token = _generate_token()
    TOKENS[token] = admin.id
    return jsonify({"token": token, "admin": admin.to_dict()}), 200


@admin_bp.route("/verify", methods=["GET"])
@require_admin
def verify_token():
    """Verify a token is still valid."""
    return jsonify({"valid": True, "admin": g.admin_user.to_dict()}), 200


@admin_bp.route("/logout", methods=["POST"])
@require_admin
def logout():
    """Invalidate the current token."""
    auth = request.headers.get("Authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    TOKENS.pop(token, None)
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
    try:
        webinar.title = data.get("title", webinar.title)
        webinar.speaker = data.get("speaker", webinar.speaker)
        webinar.speaker_title = data.get("speaker_title", webinar.speaker_title)
        webinar.date = data.get("date", webinar.date)
        webinar.time = data.get("time", webinar.time)
        webinar.description = data.get("description", webinar.description)
        webinar.max_capacity = data.get("max_capacity", webinar.max_capacity)
        webinar.is_active = data.get("is_active", webinar.is_active)
        db.session.commit()
        return jsonify(webinar.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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

    try:
        # If activating this challenge, deactivate all others
        if data.get("is_active"):
            WeeklyChallenge.query.filter(
                WeeklyChallenge.id != challenge_id
            ).filter_by(is_active=True).update({"is_active": False})

        challenge.title = data.get("title", challenge.title)
        challenge.week_start = data.get("week_start", challenge.week_start)
        challenge.week_end = data.get("week_end", challenge.week_end)
        challenge.questions = data.get("questions", challenge.questions)
        challenge.is_active = data.get("is_active", challenge.is_active)
        db.session.commit()
        return jsonify(challenge.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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
        total_trees = db.session.query(db.func.sum(DistrictMetric.trees_planted)).scalar() or 0

        return jsonify({
            "total_pledges": pledges,
            "total_certificates": certificates,
            "total_applications": applications,
            "total_contacts": contacts,
            "total_districts": districts,        "total_opportunities": opportunities,
        "total_stories": ImpactStory.query.count(),
        "total_webinars": Webinar.query.count(),
        "total_trees_planted": total_trees,
        }), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Manage Opportunities
# ---------------------------------------------------------------------------


@admin_bp.route("/opportunities", methods=["GET"])
@require_admin
def list_opportunities_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    pag = Opportunity.query.order_by(Opportunity.created_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [o.to_dict() for o in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
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
        db.session.rollback()
        traceback.print_exc()
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
        like = f"%{search}%"
        q = q.filter(
            db.or_(
                Certificate.recipient_name.ilike(like),
                Certificate.recipient_email.ilike(like),
                Certificate.certificate_code.ilike(like),
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
    try:
        cert.recipient_name = data.get("recipient_name", cert.recipient_name)
        cert.recipient_email = data.get("recipient_email", cert.recipient_email)
        cert.score = data.get("score", cert.score)
        db.session.commit()
        return jsonify(cert.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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


@admin_bp.route("/applications", methods=["GET"])
@require_admin
def list_applications_admin():
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    pag = Application.query.order_by(Application.submitted_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [a.to_dict() for a in pag.items],
        "total": pag.total,
        "page": pag.page,
        "pages": pag.pages,
    }), 200


@admin_bp.route("/applications/<int:app_id>", methods=["PATCH"])
@require_admin
def update_application_status(app_id):
    app_rec = db.session.get(Application, app_id)
    if not app_rec:
        return jsonify({"error": "Application not found"}), 404
    data = request.get_json(silent=True)
    if not data or "status" not in data:
        return jsonify({"error": "Status field required"}), 400
    valid = {"pending", "reviewed", "shortlisted", "accepted", "rejected"}
    if data["status"] not in valid:
        return jsonify({"error": f"Invalid status. Valid: {', '.join(sorted(valid))}"}), 422
    try:
        app_rec.status = data["status"]
        db.session.commit()
        return jsonify(app_rec.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


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

    exists = DistrictMetric.query.filter_by(district_name=data.get("district_name", "")).first()
    if exists:
        return jsonify({"error": "District already exists"}), 409

    try:
        metric = DistrictMetric(
            district_name=data.get("district_name", ""),
            province=data.get("province", "Eastern Province"),
            province_key=data.get("province_key", "east"),
            description=data.get("description", ""),
            species=data.get("species", []),
            map_coords_x=data.get("map_coords_x", 50.0),
            map_coords_y=data.get("map_coords_y", 50.0),
            trees_planted=data.get("trees_planted", 0),
            community_members=data.get("community_members", 0),
            farmers_trained=data.get("farmers_trained", 0),
            active_sites=data.get("active_sites", 0),
        )
        db.session.add(metric)
        db.session.commit()
        return jsonify(metric.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
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
    try:
        metric.district_name = data.get("district_name", metric.district_name)
        metric.province = data.get("province", metric.province)
        metric.province_key = data.get("province_key", metric.province_key)
        metric.description = data.get("description", metric.description)
        metric.species = data.get("species", metric.species)
        metric.map_coords_x = data.get("map_coords_x", metric.map_coords_x)
        metric.map_coords_y = data.get("map_coords_y", metric.map_coords_y)
        metric.trees_planted = data.get("trees_planted", metric.trees_planted)
        metric.community_members = data.get("community_members", metric.community_members)
        metric.farmers_trained = data.get("farmers_trained", metric.farmers_trained)
        metric.active_sites = data.get("active_sites", metric.active_sites)
        db.session.commit()
        return jsonify(metric.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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
    try:
        target.year = data.get("year", target.year)
        target.trees_target = data.get("trees_target", target.trees_target)
        target.members_target = data.get("members_target", target.members_target)
        target.farmers_target = data.get("farmers_target", target.farmers_target)
        target.sites_target = data.get("sites_target", target.sites_target)
        db.session.commit()
        return jsonify(target.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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
    try:
        goal.title = data.get("title", goal.title)
        goal.description = data.get("description", goal.description)
        goal.icon = data.get("icon", goal.icon)
        goal.milestone = data.get("milestone", goal.milestone)
        goal.action_details = data.get("action_details", goal.action_details)
        goal.sort_order = data.get("sort_order", goal.sort_order)
        goal.is_active = data.get("is_active", goal.is_active)
        db.session.commit()
        return jsonify(goal.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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
    try:
        story.name = data.get("name", story.name)
        story.title = data.get("title", story.title)
        story.quote = data.get("quote", story.quote)
        story.initials = data.get("initials", story.initials) or story.name[:2].upper()
        story.district_name = data.get("district_name", story.district_name)
        story.is_active = data.get("is_active", story.is_active)
        story.sort_order = data.get("sort_order", story.sort_order)
        db.session.commit()
        return jsonify(story.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
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
