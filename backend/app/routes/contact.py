"""
/api/contact – community inquiry submissions.
"""
import logging

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app import db
from app.email_service import send_contact_notification
from app.models import ContactMessage
from app.schemas import ContactRequestSchema

contact_bp = Blueprint("contact", __name__)
logger = logging.getLogger(__name__)


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

        # Deliver a copy of the submission to the We4Climate inbox.
        email_sent = send_contact_notification(
            name=msg.name,
            email=msg.email,
            subject=msg.subject,
            message=msg.message,
        )

        return jsonify({
            "message": "Your inquiry has been received. We will respond shortly.",
            "contact": msg.to_dict(),
            "email_sent": email_sent,
        }), 201
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to save contact message")
        return jsonify({"error": "Failed to save contact message", "details": str(exc)}), 500
