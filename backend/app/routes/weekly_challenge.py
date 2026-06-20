"""
/api/weekly-challenge – public endpoint for the current active weekly challenge.
"""
from datetime import date

from flask import Blueprint, jsonify, request

from app import db
from app.models import WeeklyChallenge

weekly_challenge_bp = Blueprint("weekly_challenge", __name__)


@weekly_challenge_bp.route("", methods=["GET"])
def get_active_challenge():
    """Return the currently active weekly challenge, or 404 if none is set."""
    challenge = WeeklyChallenge.query.filter_by(is_active=True).first()
    if not challenge:
        return jsonify({"error": "No active weekly challenge"}), 404
    return jsonify(challenge.to_dict()), 200


@weekly_challenge_bp.route("/complete", methods=["POST"])
def record_completion():
    """Increment the completion count for the active challenge.
    Called from the frontend after a user earns a certificate.
    """
    challenge = WeeklyChallenge.query.filter_by(is_active=True).first()
    if not challenge:
        return jsonify({"error": "No active weekly challenge"}), 404
    challenge.completion_count = (challenge.completion_count or 0) + 1
    db.session.commit()
    return jsonify({
        "message": "Completion recorded",
        "completion_count": challenge.completion_count,
    }), 200
