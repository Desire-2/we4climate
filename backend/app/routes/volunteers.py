"""
/api/volunteers – dedicated volunteer management endpoints.
"""
import csv
import io
import logging

from flask import Blueprint, Response, g, jsonify, request
from marshmallow import ValidationError

from app import db
from app.models import AdminUser, Volunteer
from app.routes.admin import require_admin
from app.storage import delete_file, upload_file

volunteers_bp = Blueprint("volunteers", __name__)
logger = logging.getLogger(__name__)

VOLUNTEER_ATTACHMENT_RULES = {
    "passportCopy": {".pdf", ".jpg", ".jpeg", ".png"},
    "passportPhoto": {".jpg", ".jpeg", ".png", ".pdf"},
    "cv": {".pdf", ".doc", ".docx"},
    "motivationLetter": {".pdf", ".doc", ".docx"},
    "recommendationLetter": {".pdf", ".doc", ".docx"},
    "certificates": {".pdf", ".jpg", ".jpeg", ".png"},
}

VALID_VOLUNTEER_STATUSES = {"pending", "approved", "active", "completed", "suspended", "rejected"}


def _save_volunteer_files() -> tuple[dict[str, str], list[str]]:
    """Upload validated multipart attachments and return URLs plus stored paths."""
    uploaded: dict[str, str] = {}
    saved_paths: list[str] = []

    for field_name, allowed_extensions in VOLUNTEER_ATTACHMENT_RULES.items():
        file = request.files.get(field_name)
        if not file or not file.filename:
            continue

        url = upload_file(field_name, file, allowed_extensions, prefix="volunteers")
        saved_paths.append(url)
        uploaded[field_name] = url

    return uploaded, saved_paths


# ---------------------------------------------------------------------------
# Public: Submit a volunteer application
# ---------------------------------------------------------------------------
@volunteers_bp.route("", methods=["POST"])
def submit_volunteer():
    """Submit a volunteer application with structured fields and file attachments."""
    data = request.form.to_dict() if request.form else None
    if not data:
        return jsonify({"error": "Invalid payload", "details": "Request body must be multipart form data."}), 400

    from app.schemas import VolunteerRequestSchema
    schema = VolunteerRequestSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    saved_paths: list[str] = []
    try:
        uploaded_files, saved_paths = _save_volunteer_files()

        volunteer = Volunteer(
            full_name=validated["fullName"],
            gender=validated.get("gender"),
            date_of_birth=validated.get("dateOfBirth"),
            nationality=validated.get("nationality"),
            country_of_residence=validated.get("countryOfResidence"),
            passport_number=validated.get("passportNumber"),
            email=validated["email"],
            phone=validated.get("phone"),
            occupation=validated.get("occupation"),
            organization=validated.get("organization"),
            emergency_full_name=validated.get("emergencyFullName"),
            emergency_relationship=validated.get("emergencyRelationship"),
            emergency_country=validated.get("emergencyCountry"),
            emergency_phone=validated.get("emergencyPhone"),
            emergency_email=validated.get("emergencyEmail"),
            programs=validated.get("programs", []),
            other_program=validated.get("otherProgram"),
            arrival_date=validated.get("arrivalDate"),
            departure_date=validated.get("departureDate"),
            length_of_stay=validated.get("lengthOfStay"),
            availability=validated.get("availability"),
            educational_background=validated.get("educationalBackground"),
            professional_experience=validated.get("professionalExperience"),
            technical_skills=validated.get("technicalSkills"),
            languages_spoken=validated.get("languagesSpoken"),
            previous_volunteer_experience=validated.get("previousVolunteerExperience"),
            relevant_certifications=validated.get("relevantCertifications"),
            motivation=validated.get("motivation"),
            hope_to_learn=validated.get("hopeToLearn"),
            contribution=validated.get("contribution"),
            medical_conditions=validated.get("medicalConditions"),
            allergies=validated.get("allergies"),
            dietary_requirements=validated.get("dietaryRequirements"),
            emergency_medical_info=validated.get("emergencyMedicalInformation"),
            need_accommodation=validated.get("needAccommodation"),
            room_preference=validated.get("roomPreference"),
            need_invitation_letter=validated.get("needInvitationLetter"),
            need_airport_pickup=validated.get("needAirportPickup"),
            expected_arrival_airport=validated.get("expectedArrivalAirport"),
            flight_details=validated.get("flightDetails"),
            media_consent=validated.get("mediaConsent"),
            code_of_conduct=validated.get("conduct", []),
            declaration_accepted=validated.get("declarationAccepted", False),
            applicant_name_declaration=validated.get("applicantName"),
            signature=validated.get("signature"),
            declaration_date=validated.get("declarationDate"),
            passport_copy_url=uploaded_files.get("passportCopy"),
            passport_photo_url=uploaded_files.get("passportPhoto"),
            cv_url=uploaded_files.get("cv"),
            motivation_letter_url=uploaded_files.get("motivationLetter"),
            recommendation_letter_url=uploaded_files.get("recommendationLetter"),
            certificates_url=uploaded_files.get("certificates"),
        )

        db.session.add(volunteer)
        db.session.commit()

        # Send confirmation email (best-effort)
        try:
            from app.email_service import send_email
            programs_text = ", ".join(volunteer.programs or []) or "Not specified"
            send_email(
                to=volunteer.email,
                subject="Volunteer Application Received – We4Climate",
                html=f"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="color:#065f46;">Thank you for your volunteer application!</h2>
                    <p>Dear {volunteer.full_name},</p>
                    <p>We have received your volunteer application for the <strong>Leonard Regeneration Center</strong> international volunteer program.</p>
                    <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;">
                        <p><strong>Application Reference:</strong> VOL-{volunteer.id}</p>
                        <p><strong>Programs of Interest:</strong> {programs_text}</p>
                        <p><strong>Preferred Dates:</strong> {volunteer.arrival_date or 'TBD'} to {volunteer.departure_date or 'TBD'}</p>
                    </div>
                    <p>Our team will review your application and contact you by email within 5-7 business days with next steps.</p>
                    <p>If you have any questions, please don't hesitate to reach out to us at <a href="mailto:info@we4climate.org">info@we4climate.org</a>.</p>
                    <p>Warm regards,<br/>The We4Climate Team</p>
                </div>
                """,
            )
        except Exception as email_err:
            logger.warning("Failed to send volunteer confirmation email: %s", email_err)

        return jsonify({
            "message": "Volunteer application submitted successfully",
            "volunteer": volunteer.to_dict(),
        }), 201

    except Exception as exc:
        db.session.rollback()
        for path in saved_paths:
            delete_file(path)
        logger.exception("Failed to submit volunteer application")
        return jsonify({"error": "Failed to submit volunteer application", "details": str(exc)}), 500


# ---------------------------------------------------------------------------
# Admin: List all volunteers with filtering and stats
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin", methods=["GET"])
@require_admin
def list_volunteers_admin():
    """List all volunteer applications with filtering, search, and pagination."""
    page = request.args.get("page", 1, type=int)
    per = request.args.get("per_page", 50, type=int)
    status_filter = (request.args.get("status") or "").strip().lower()
    search = (request.args.get("search") or "").strip()
    program_filter = (request.args.get("program") or "").strip()

    q = Volunteer.query

    if status_filter and status_filter in VALID_VOLUNTEER_STATUSES:
        q = q.filter(Volunteer.status == status_filter)
    if search:
        safe_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        like = f"%{safe_search}%"
        q = q.filter(
            db.or_(
                Volunteer.full_name.ilike(like, escape="\\"),
                Volunteer.email.ilike(like, escape="\\"),
                Volunteer.nationality.ilike(like, escape="\\"),
                Volunteer.phone.ilike(like, escape="\\"),
            )
        )
    if program_filter:
        q = q.filter(Volunteer.programs.contains([program_filter]))

    total_filtered = q.count()

    # Status counts
    status_counts = {}
    for s in VALID_VOLUNTEER_STATUSES:
        status_counts[s] = Volunteer.query.filter(Volunteer.status == s).count()

    pag = q.order_by(Volunteer.submitted_at.desc()).paginate(
        page=page, per_page=per, error_out=False
    )
    return jsonify({
        "items": [v.to_dict() for v in pag.items],
        "total": Volunteer.query.count(),
        "total_filtered": total_filtered,
        "page": pag.page,
        "pages": pag.pages,
        "status_counts": status_counts,
    }), 200


# ---------------------------------------------------------------------------
# Admin: Get single volunteer
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/<int:vol_id>", methods=["GET"])
@require_admin
def get_volunteer_admin(vol_id):
    """Get a single volunteer by ID."""
    volunteer = db.session.get(Volunteer, vol_id)
    if not volunteer:
        return jsonify({"error": "Volunteer not found"}), 404
    return jsonify(volunteer.to_dict()), 200


# ---------------------------------------------------------------------------
# Admin: Update volunteer status/notes/hours/rating
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/<int:vol_id>", methods=["PATCH"])
@require_admin
def update_volunteer_admin(vol_id):
    """Update a volunteer's status, notes, hours, or rating."""
    volunteer = db.session.get(Volunteer, vol_id)
    if not volunteer:
        return jsonify({"error": "Volunteer not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    from app.schemas import VolunteerAdminUpdateSchema
    schema = VolunteerAdminUpdateSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        if "status" in data and data["status"] is not None:
            new_status = data["status"]
            old_status = volunteer.status
            message = (data.get("status_message") or "").strip()
            volunteer.status = new_status
            if message:
                volunteer.status_message = message

            # Send status-change email (best-effort)
            if new_status != old_status:
                try:
                    from app.email_service import send_email
                    from app.volunteer_emails import (
                        volunteer_approved, volunteer_rejected,
                        volunteer_suspended, volunteer_completed,
                    )
                    programs_text = ", ".join(volunteer.programs or []) or ""

                    if new_status == "approved":
                        subject, html = volunteer_approved(
                            volunteer.full_name, programs_text,
                            volunteer.arrival_date or "", volunteer.departure_date or "",
                            message,
                        )
                    elif new_status == "rejected":
                        subject, html = volunteer_rejected(
                            volunteer.full_name, message, message,
                        )
                    elif new_status == "suspended":
                        subject, html = volunteer_suspended(
                            volunteer.full_name, message, message,
                        )
                    elif new_status == "completed":
                        subject, html = volunteer_completed(
                            volunteer.full_name, volunteer.hours_logged,
                            programs_text, message,
                        )
                    else:
                        subject = html = None

                    if subject and html:
                        send_email(volunteer.email, subject, html)
                except Exception as email_err:
                    logger.warning("Failed to send status email to %s: %s", volunteer.email, email_err)

        if "hours_logged" in data and data["hours_logged"] is not None:
            volunteer.hours_logged = float(data["hours_logged"])
        if "rating" in data:
            volunteer.rating = data["rating"] if data["rating"] is not None else None
        if "admin_notes" in data:
            volunteer.admin_notes = data["admin_notes"] if data["admin_notes"] else None
        db.session.commit()
        return jsonify(volunteer.to_dict()), 200
    except Exception as exc:
        db.session.rollback()
        logger.exception("Failed to update volunteer %s", vol_id)
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Admin: Log hours for a volunteer
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/<int:vol_id>/hours", methods=["POST"])
@require_admin
def log_volunteer_hours(vol_id):
    """Add hours to a volunteer's total."""
    volunteer = db.session.get(Volunteer, vol_id)
    if not volunteer:
        return jsonify({"error": "Volunteer not found"}), 404

    data = request.get_json(silent=True)
    if not data or "hours" not in data:
        return jsonify({"error": "hours field is required"}), 400

    from app.schemas import VolunteerHoursSchema
    schema = VolunteerHoursSchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        volunteer.hours_logged += validated["hours"]
        db.session.commit()
        return jsonify({
            "message": f"Added {validated['hours']} hours",
            "hours_logged": volunteer.hours_logged,
            "volunteer": volunteer.to_dict(),
        }), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Admin: Delete volunteer
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/<int:vol_id>", methods=["DELETE"])
@require_admin
def delete_volunteer_admin(vol_id):
    """Delete a volunteer record."""
    volunteer = db.session.get(Volunteer, vol_id)
    if not volunteer:
        return jsonify({"error": "Volunteer not found"}), 404
    try:
        db.session.delete(volunteer)
        db.session.commit()
        return jsonify({"message": "Volunteer deleted"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Admin: Bulk update volunteers
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/bulk", methods=["POST"])
@require_admin
def bulk_update_volunteers():
    """Bulk update status for multiple volunteers."""
    data = request.get_json(silent=True)
    if not data or "ids" not in data:
        return jsonify({"error": "ids list is required"}), 400

    ids = data["ids"]
    status = data.get("status")

    if not isinstance(ids, list) or not ids:
        return jsonify({"error": "ids must be a non-empty list"}), 422
    if status and status not in VALID_VOLUNTEER_STATUSES:
        return jsonify({"error": f"Invalid status. Valid: {', '.join(sorted(VALID_VOLUNTEER_STATUSES))}"}), 422

    try:
        volunteers = Volunteer.query.filter(Volunteer.id.in_(ids)).all()
        updated = 0
        for v in volunteers:
            if status:
                v.status = status
            updated += 1
        db.session.commit()
        return jsonify({"message": f"Updated {updated} volunteers", "updated": updated}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Admin: Volunteer statistics
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/stats", methods=["GET"])
@require_admin
def volunteer_stats():
    """Return aggregate volunteer statistics."""
    total = Volunteer.query.count()
    pending = Volunteer.query.filter_by(status="pending").count()
    approved = Volunteer.query.filter_by(status="approved").count()
    active = Volunteer.query.filter_by(status="active").count()
    completed = Volunteer.query.filter_by(status="completed").count()
    rejected = Volunteer.query.filter_by(status="rejected").count()
    suspended = Volunteer.query.filter_by(status="suspended").count()

    total_hours = db.session.query(db.func.sum(Volunteer.hours_logged)).scalar() or 0
    avg_hours = db.session.query(db.func.avg(Volunteer.hours_logged)).scalar() or 0

    # Top programs
    all_volunteers = Volunteer.query.all()
    program_counts: dict[str, int] = {}
    for v in all_volunteers:
        for prog in (v.programs or []):
            program_counts[prog] = program_counts.get(prog, 0) + 1
    top_programs = sorted(program_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    # Nationality distribution
    nationality_counts: dict[str, int] = {}
    for v in all_volunteers:
        nat = v.nationality or "Unknown"
        nationality_counts[nat] = nationality_counts.get(nat, 0) + 1
    top_nationalities = sorted(nationality_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    # Availability breakdown
    availability_counts: dict[str, int] = {}
    for v in all_volunteers:
        avail = v.availability or "Not specified"
        availability_counts[avail] = availability_counts.get(avail, 0) + 1

    return jsonify({
        "total": total,
        "pending": pending,
        "approved": approved,
        "active": active,
        "completed": completed,
        "rejected": rejected,
        "suspended": suspended,
        "total_hours_logged": round(float(total_hours), 1),
        "average_hours": round(float(avg_hours), 1),
        "top_programs": [{"name": name, "count": count} for name, count in top_programs],
        "top_nationalities": [{"name": name, "count": count} for name, count in top_nationalities],
        "availability_breakdown": availability_counts,
    }), 200


# ---------------------------------------------------------------------------
# Admin: Export volunteers as CSV
# ---------------------------------------------------------------------------
@volunteers_bp.route("/admin/export", methods=["GET"])
@require_admin
def export_volunteers_csv():
    """Export volunteer applications as CSV."""
    status_filter = (request.args.get("status") or "").strip().lower()
    q = Volunteer.query
    if status_filter and status_filter in VALID_VOLUNTEER_STATUSES:
        q = q.filter(Volunteer.status == status_filter)

    volunteers = q.order_by(Volunteer.submitted_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Email", "Phone", "Nationality", "Status",
        "Programs", "Arrival", "Departure", "Hours", "Rating",
        "Submitted",
    ])

    for v in volunteers:
        writer.writerow([
            v.id, v.full_name, v.email, v.phone or "",
            v.nationality or "", v.status,
            ", ".join(v.programs or []),
            v.arrival_date or "", v.departure_date or "",
            v.hours_logged, v.rating or "",
            v.submitted_at.isoformat() if v.submitted_at else "",
        ])

    csv_content = output.getvalue()
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=volunteers_export.csv"},
    )
