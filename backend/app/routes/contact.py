"""
/api/contact – community inquiry submissions.
"""
import traceback

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app import db
from app.models import ContactMessage
from app.schemas import ContactRequestSchema

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("", methods=["POST"])
def submit_contact():
    """Submit a contact / inquiry message from the community."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be valid JSON."}), 400

    schema = ContactRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Invalid payload parameters", "details": err.messages}), 422

    try:
        msg = ContactMessage(
            name=validated["name"],
            email=validated["email"],
            subject=validated["subject"],
            message=validated["message"],
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify({
            "message": "Your inquiry has been received. We will respond shortly.",
            "contact": msg.to_dict(),
        }), 201
    except Exception as exc:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Failed to save contact message", "details": str(exc)}), 500
