"""
/api/pledges – community tree-planting pledges.
"""
import traceback

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app import db
from app.models import Pledge, DistrictMetric
from app.schemas import PledgeSchema

pledges_bp = Blueprint("pledges", __name__)


@pledges_bp.route("", methods=["GET"])
def list_pledges():
    """Return the 50 most recent pledges in reverse chronological order."""
    try:
        pledges = (
            Pledge.query.order_by(Pledge.timestamp.desc()).limit(50).all()
        )
        return jsonify([p.to_dict() for p in pledges]), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch pledges", "details": str(exc)}), 500


@pledges_bp.route("", methods=["POST"])
def create_pledge():
    """Create a new pledge and update the corresponding district metrics."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be valid JSON."}), 400

    schema = PledgeSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Invalid payload parameters", "details": err.messages}), 422

    try:
        pledge = Pledge(
            name=validated["name"],
            district=validated["district"],
            trees_count=validated["trees_count"],
            tree_type=validated["tree_type"],
        )
        db.session.add(pledge)

        # Upsert the district metric
        metric = DistrictMetric.query.filter_by(
            district_name=validated["district"]
        ).first()
        if metric:
            metric.trees_planted += validated["trees_count"]
        else:
            metric = DistrictMetric(
                district_name=validated["district"],
                trees_planted=validated["trees_count"],
                community_members=0,
                farmers_trained=0,
                active_sites=0,
            )
            db.session.add(metric)

        db.session.commit()
        return jsonify(pledge.to_dict()), 201
    except Exception as exc:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Failed to create pledge", "details": str(exc)}), 500
