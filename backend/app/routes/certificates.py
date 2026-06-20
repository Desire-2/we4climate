"""
/api/certificates – climate quiz certification.
"""
import traceback

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app import db
from app.models import Certificate
from app.schemas import CertificateRequestSchema

certificates_bp = Blueprint("certificates", __name__)


@certificates_bp.route("", methods=["POST"])
def issue_certificate():
    """Issue a certificate when a user scores 3/3 on the climate quiz."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be valid JSON."}), 400

    schema = CertificateRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Invalid payload parameters", "details": err.messages}), 422

    if validated["score"] != 3:
        return jsonify({
            "error": "Certificate requires a perfect score",
            "details": "Only a score of 3/3 qualifies for a We4Climate Community Advocate Certificate.",
        }), 422

    try:
        certificate = Certificate(
            recipient_name=validated["recipient_name"],
            recipient_email=validated["recipient_email"],
            score=validated["score"],
        )
        db.session.add(certificate)
        db.session.commit()
        return jsonify(certificate.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Failed to issue certificate", "details": str(exc)}), 500
