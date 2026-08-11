"""
/api/opportunities – job, internship, volunteer & workshop postings and applications.
"""
import json
import os
import traceback
import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from marshmallow import ValidationError
from werkzeug.utils import secure_filename

from app import db
from app.models import Application, Opportunity
from app.schemas import ApplicationRequestSchema

opportunities_bp = Blueprint("opportunities", __name__)

ATTACHMENT_RULES = {
    "passportCopy": {".pdf", ".jpg", ".jpeg", ".png"},
    "passportPhoto": {".jpg", ".jpeg", ".png", ".pdf"},
    "cv": {".pdf", ".doc", ".docx"},
    "motivationLetter": {".pdf", ".doc", ".docx"},
    "recommendationLetter": {".pdf", ".doc", ".docx"},
    "certificates": {".pdf", ".jpg", ".jpeg", ".png"},
}


def _save_application_files() -> tuple[dict[str, str], list[str]]:
    """Save validated multipart attachments and return public paths plus disk paths."""
    uploaded: dict[str, str] = {}
    saved_paths: list[str] = []
    upload_folder = current_app.config["UPLOAD_FOLDER"]

    for field_name, allowed_extensions in ATTACHMENT_RULES.items():
        file = request.files.get(field_name)
        if not file or not file.filename:
            continue

        safe_name = secure_filename(file.filename)
        extension = Path(safe_name).suffix.lower()
        if not safe_name or extension not in allowed_extensions:
            raise ValueError(f"Unsupported file type for {field_name}")

        stored_name = f"{uuid.uuid4().hex}_{safe_name}"
        disk_path = os.path.join(upload_folder, stored_name)
        file.save(disk_path)
        saved_paths.append(disk_path)
        uploaded[field_name] = f"/uploads/applications/{stored_name}"

    return uploaded, saved_paths


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
    data = request.form.to_dict() if request.form else request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be valid JSON or multipart form data."}), 400

    schema = ApplicationRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Invalid payload parameters", "details": err.messages}), 422

    saved_paths: list[str] = []
    try:
        uploaded_files, saved_paths = _save_application_files()
        cover_letter = validated.get("cover_letter")
        if uploaded_files:
            try:
                details = json.loads(cover_letter or "{}")
                if isinstance(details, dict):
                    details["attachmentUrls"] = uploaded_files
                    cover_letter = json.dumps(details)
            except (TypeError, json.JSONDecodeError):
                pass

        application = Application(
            opportunity_id=validated["opportunity_id"],
            applicant_name=validated["applicant_name"],
            applicant_email=validated["applicant_email"],
            resume_url=uploaded_files.get("cv") or validated.get("resume_url"),
            cover_letter=cover_letter,
        )
        db.session.add(application)
        db.session.commit()
        return jsonify({
            "message": "Application submitted successfully",
            "application": application.to_dict(),
        }), 201
    except Exception as exc:
        db.session.rollback()
        for path in saved_paths:
            try:
                os.remove(path)
            except OSError:
                pass
        traceback.print_exc()
        return jsonify({"error": "Failed to submit application", "details": str(exc)}), 500
