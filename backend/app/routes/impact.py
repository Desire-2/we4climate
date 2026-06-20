"""
/api/impact – dynamic district metrics, stories, and aggregate counters.
"""
import traceback

from flask import Blueprint, jsonify

from app.models import DistrictMetric, ImpactStory, YearlyTarget, ImpactGoal

impact_bp = Blueprint("impact", __name__)


@impact_bp.route("/summary", methods=["GET"])
def summary():
    """Return aggregated totals across all districts."""
    try:
        rows = DistrictMetric.query.all()
        total_trees = sum(r.trees_planted for r in rows)
        total_members = sum(r.community_members for r in rows)
        total_farmers = sum(r.farmers_trained for r in rows)
        total_sites = sum(r.active_sites for r in rows)

        return jsonify({
            "total_trees_planted": total_trees,
            "total_community_members": total_members,
            "total_farmers_trained": total_farmers,
            "total_active_sites": total_sites,
        }), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to compute summary", "details": str(exc)}), 500


@impact_bp.route("/districts", methods=["GET"])
def districts():
    """Return enhanced metrics for every district."""
    try:
        rows = DistrictMetric.query.order_by(DistrictMetric.district_name).all()
        return jsonify([r.to_dict() for r in rows]), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch districts", "details": str(exc)}), 500


@impact_bp.route("/yearly-targets", methods=["GET"])
def yearly_targets():
    """Return all yearly targets, ordered by year ascending."""
    try:
        rows = YearlyTarget.query.order_by(YearlyTarget.year.asc()).all()
        return jsonify([r.to_dict() for r in rows]), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch yearly targets", "details": str(exc)}), 500


@impact_bp.route("/goals", methods=["GET"])
def goals():
    """Return all active impact goals (10 Pillars), ordered by sort_order."""
    try:
        rows = ImpactGoal.query.filter_by(is_active=True).order_by(ImpactGoal.sort_order.asc()).all()
        return jsonify([r.to_dict() for r in rows]), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch goals", "details": str(exc)}), 500


@impact_bp.route("/stories", methods=["GET"])
def stories():
    """Return all active impact stories, ordered by sort_order."""
    try:
        rows = ImpactStory.query.filter_by(is_active=True).order_by(ImpactStory.sort_order.asc()).all()
        return jsonify([r.to_dict() for r in rows]), 200
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch stories", "details": str(exc)}), 500
