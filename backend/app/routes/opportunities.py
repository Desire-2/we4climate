"""
/api/opportunities – job, internship, volunteer & workshop postings and applications.
"""
import traceback

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app import db
from app.models import Application, Opportunity
from app.schemas import ApplicationRequestSchema

opportunities_bp = Blueprint("opportunities", __name__)


@opportunities_bp.route("", methods=["GET"])
def list_opportunities():
    """List all active opportunities."""
    opportunities = Opportunity.query.filter_by(is_active=True).order_by(Opportunity.created_at.desc()).all()
    return jsonify([o.to_dict() for o in opportunities]), 200


@opportunities_bp.route("/<int:opp_id>", methods=["GET"])
def get_opportunity(opp_id):
    """Get a single opportunity by ID."""
    opp = db.session.get(Opportunity, opp_id)
    if not opp:
        return jsonify({"error": "Opportunity not found"}), 404
    return jsonify(opp.to_dict()), 200


@opportunities_bp.route("/apply", methods=["POST"])
def submit_application():
    """Submit an application for a job, internship, volunteer role, or workshop."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be valid JSON."}), 400

    schema = ApplicationRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Invalid payload parameters", "details": err.messages}), 422

    try:
        application = Application(
            opportunity_id=validated["opportunity_id"],
            applicant_name=validated["applicant_name"],
            applicant_email=validated["applicant_email"],
            resume_url=validated.get("resume_url"),
            cover_letter=validated.get("cover_letter"),
        )
        db.session.add(application)
        db.session.commit()
        return jsonify({
            "message": "Application submitted successfully",
            "application": application.to_dict(),
        }), 201
    except Exception as exc:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Failed to submit application", "details": str(exc)}), 500
