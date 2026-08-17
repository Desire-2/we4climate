"""
/api/webinars – public endpoint for listing and registering for webinars.
"""
from flask import Blueprint, jsonify, request

from app import db
from app.models import Webinar, WebinarRegistration

webinar_bp = Blueprint("webinars", __name__)


@webinar_bp.route("", methods=["GET"])
def list_webinars():
    """Return all active webinars."""
    active = request.args.get("all") != "1"
    q = Webinar.query
    if active:
        q = q.filter_by(is_active=True)
    rows = q.order_by(Webinar.date.asc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@webinar_bp.route("/<int:webinar_id>/register", methods=["POST"])
def register_for_webinar(webinar_id):
    """Register an email for a webinar (prevents duplicates)."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    webinar = db.session.get(Webinar, webinar_id)
    if not webinar:
        return jsonify({"error": "Webinar not found"}), 404
    if not webinar.is_active:
        return jsonify({"error": "Webinar is not active"}), 400
    if webinar.max_capacity and (webinar.registered_count or 0) >= webinar.max_capacity:
        return jsonify({"error": "Webinar is full"}), 400

    existing = WebinarRegistration.query.filter_by(
        webinar_id=webinar_id, email=email
    ).first()
    if existing:
        return jsonify({"error": "You are already registered for this webinar"}), 409

    db.session.add(WebinarRegistration(webinar_id=webinar_id, email=email))
    webinar.registered_count = (webinar.registered_count or 0) + 1
    db.session.commit()
    return jsonify({
        "message": "Registration successful",
        "registered_count": webinar.registered_count,
    }), 200
