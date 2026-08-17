"""
SQLAlchemy database models for the We4Climate platform.
"""
import uuid
from datetime import datetime, timezone

from app import db


def _generate_certificate_code() -> str:
    """Generate a unique certificate code like W4C-A3F8-2B91."""
    suffix = uuid.uuid4().hex[:8].upper()
    return f"W4C-{suffix[:4]}-{suffix[4:]}"


# -----------------------------------------------------------------------
# Pledge
# -----------------------------------------------------------------------
class Pledge(db.Model):
    __tablename__ = "pledges"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    district = db.Column(db.String(255), nullable=False)
    trees_count = db.Column(db.Integer, nullable=False)
    tree_type = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "district": self.district,
            "trees_count": self.trees_count,
            "tree_type": self.tree_type,
            "timestamp": self.timestamp.isoformat(),
        }


# -----------------------------------------------------------------------
# Certificate
# -----------------------------------------------------------------------
class Certificate(db.Model):
    __tablename__ = "certificates"

    id = db.Column(db.Integer, primary_key=True)
    recipient_name = db.Column(db.String(255), nullable=False)
    recipient_email = db.Column(db.String(255), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    certificate_code = db.Column(
        db.String(20), unique=True, nullable=False, default=_generate_certificate_code
    )
    issued_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "recipient_name": self.recipient_name,
            "recipient_email": self.recipient_email,
            "score": self.score,
            "certificate_code": self.certificate_code,
            "issued_at": self.issued_at.isoformat(),
        }


# -----------------------------------------------------------------------
# Opportunity (job / internship / volunteer / workshop postings)
# -----------------------------------------------------------------------
class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Job | Internship | Volunteer | Workshop
    location = db.Column(db.String(255), nullable=False)
    deadline = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.JSON, nullable=True)  # list of strings
    is_external = db.Column(db.Boolean, default=False, server_default="0", nullable=False)
    external_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "location": self.location,
            "deadline": self.deadline,
            "description": self.description,
            "requirements": self.requirements or [],
            "is_external": self.is_external,
            "external_url": self.external_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# Application (job / internship / volunteer / workshop)
# -----------------------------------------------------------------------
class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    opportunity_id = db.Column(db.String(50), nullable=False)
    applicant_name = db.Column(db.String(255), nullable=False)
    applicant_email = db.Column(db.String(255), nullable=False)
    resume_url = db.Column(db.String(500), nullable=True)
    cover_letter = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="pending", nullable=False)
    admin_notes = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        opp_title = None
        try:
            opp = db.session.get(Opportunity, int(self.opportunity_id))
            if opp:
                opp_title = opp.title
        except (ValueError, TypeError):
            pass
        return {
            "id": self.id,
            "opportunity_id": self.opportunity_id,
            "opportunity_title": opp_title,
            "applicant_name": self.applicant_name,
            "applicant_email": self.applicant_email,
            "resume_url": self.resume_url,
            "cover_letter": self.cover_letter,
            "status": self.status,
            "admin_notes": self.admin_notes or "",
            "submitted_at": self.submitted_at.isoformat(),
        }


# -----------------------------------------------------------------------
# DistrictMetric
# -----------------------------------------------------------------------
class DistrictMetric(db.Model):
    __tablename__ = "district_metrics"

    id = db.Column(db.Integer, primary_key=True)
    district_name = db.Column(db.String(255), unique=True, nullable=False)
    province = db.Column(db.String(100), nullable=False, default="Eastern Province")
    province_key = db.Column(db.String(20), nullable=False, default="east")
    description = db.Column(db.Text, nullable=True, default="")
    species = db.Column(db.JSON, nullable=True, default=list)
    map_coords_x = db.Column(db.Float, nullable=True, default=50.0)
    map_coords_y = db.Column(db.Float, nullable=True, default=50.0)
    trees_planted = db.Column(db.Integer, default=0, nullable=False)
    community_members = db.Column(db.Integer, default=0, nullable=False)
    farmers_trained = db.Column(db.Integer, default=0, nullable=False)
    active_sites = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "district_name": self.district_name,
            "province": self.province,
            "province_key": self.province_key,
            "description": self.description or "",
            "species": self.species or [],
            "map_coords_x": self.map_coords_x or 50.0,
            "map_coords_y": self.map_coords_y or 50.0,
            "trees_planted": self.trees_planted,
            "community_members": self.community_members,
            "farmers_trained": self.farmers_trained,
            "active_sites": self.active_sites,
        }


# -----------------------------------------------------------------------
# Admin User
# -----------------------------------------------------------------------
class AdminUser(db.Model):
    __tablename__ = "admin_users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    token = db.Column(db.String(256), unique=True, nullable=True)
    token_created_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# Webinar
# -----------------------------------------------------------------------
class Webinar(db.Model):
    __tablename__ = "webinars"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    speaker = db.Column(db.String(255), nullable=False)
    speaker_title = db.Column(db.String(255), nullable=True)
    date = db.Column(db.String(100), nullable=False)
    time = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    registered_count = db.Column(db.Integer, default=0, nullable=False)
    max_capacity = db.Column(db.Integer, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "speaker": self.speaker,
            "speaker_title": self.speaker_title,
            "date": self.date,
            "time": self.time,
            "description": self.description,
            "registered_count": self.registered_count,
            "max_capacity": self.max_capacity,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# WebinarRegistration (prevents duplicate registrations)
# -----------------------------------------------------------------------
class WebinarRegistration(db.Model):
    __tablename__ = "webinar_registrations"

    id = db.Column(db.Integer, primary_key=True)
    webinar_id = db.Column(db.Integer, db.ForeignKey("webinars.id"), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    registered_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint("webinar_id", "email", name="uq_webinar_email"),
    )


# -----------------------------------------------------------------------
# WeeklyChallenge
# -----------------------------------------------------------------------
class WeeklyChallenge(db.Model):
    __tablename__ = "weekly_challenges"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    week_start = db.Column(db.Date, nullable=False)
    week_end = db.Column(db.Date, nullable=False)
    questions = db.Column(db.JSON, nullable=False)  # list of { text, options: str[], correct: int, explanation: str }
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    completion_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "week_start": self.week_start.isoformat(),
            "week_end": self.week_end.isoformat(),
            "questions": self.questions,
            "is_active": self.is_active,
            "completion_count": self.completion_count,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# ImpactStory
# -----------------------------------------------------------------------
class ImpactStory(db.Model):
    __tablename__ = "impact_stories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    quote = db.Column(db.Text, nullable=False)
    initials = db.Column(db.String(10), nullable=True)
    district_name = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "quote": self.quote,
            "initials": self.initials or "",
            "district_name": self.district_name or "",
            "is_active": self.is_active,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# YearlyTarget
# -----------------------------------------------------------------------
class YearlyTarget(db.Model):
    __tablename__ = "yearly_targets"

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, unique=True, nullable=False)
    trees_target = db.Column(db.Integer, default=0, nullable=False)
    members_target = db.Column(db.Integer, default=0, nullable=False)
    farmers_target = db.Column(db.Integer, default=0, nullable=False)
    sites_target = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "year": self.year,
            "trees_target": self.trees_target,
            "members_target": self.members_target,
            "farmers_target": self.farmers_target,
            "sites_target": self.sites_target,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# ImpactGoal (10 Pillars of Change)
# -----------------------------------------------------------------------
class ImpactGoal(db.Model):
    __tablename__ = "impact_goals"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), nullable=False, default="Sparkles")
    milestone = db.Column(db.String(255), nullable=False)
    action_details = db.Column(db.Text, nullable=True)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "icon": self.icon,
            "milestone": self.milestone,
            "action_details": self.action_details or "",
            "sort_order": self.sort_order,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


# -----------------------------------------------------------------------
# Volunteer (dedicated volunteer applications)
# -----------------------------------------------------------------------
class Volunteer(db.Model):
    __tablename__ = "volunteers"

    id = db.Column(db.Integer, primary_key=True)

    # Personal details
    full_name = db.Column(db.String(255), nullable=False)
    gender = db.Column(db.String(50), nullable=True)
    date_of_birth = db.Column(db.String(50), nullable=True)
    nationality = db.Column(db.String(100), nullable=True)
    country_of_residence = db.Column(db.String(100), nullable=True)
    passport_number = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(100), nullable=True)
    occupation = db.Column(db.String(255), nullable=True)
    organization = db.Column(db.String(255), nullable=True)

    # Emergency contact
    emergency_full_name = db.Column(db.String(255), nullable=True)
    emergency_relationship = db.Column(db.String(100), nullable=True)
    emergency_country = db.Column(db.String(100), nullable=True)
    emergency_phone = db.Column(db.String(100), nullable=True)
    emergency_email = db.Column(db.String(255), nullable=True)

    # Placement / program info
    programs = db.Column(db.JSON, nullable=True)  # list of program names
    other_program = db.Column(db.String(500), nullable=True)
    arrival_date = db.Column(db.String(50), nullable=True)
    departure_date = db.Column(db.String(50), nullable=True)
    length_of_stay = db.Column(db.String(100), nullable=True)
    availability = db.Column(db.String(50), nullable=True)

    # Experience
    educational_background = db.Column(db.Text, nullable=True)
    professional_experience = db.Column(db.Text, nullable=True)
    technical_skills = db.Column(db.Text, nullable=True)
    languages_spoken = db.Column(db.String(500), nullable=True)
    previous_volunteer_experience = db.Column(db.Text, nullable=True)
    relevant_certifications = db.Column(db.Text, nullable=True)
    motivation = db.Column(db.Text, nullable=True)
    hope_to_learn = db.Column(db.Text, nullable=True)
    contribution = db.Column(db.Text, nullable=True)

    # Health
    medical_conditions = db.Column(db.Text, nullable=True)
    allergies = db.Column(db.Text, nullable=True)
    dietary_requirements = db.Column(db.String(255), nullable=True)
    emergency_medical_info = db.Column(db.Text, nullable=True)

    # Accommodation & travel
    need_accommodation = db.Column(db.String(10), nullable=True)
    room_preference = db.Column(db.String(50), nullable=True)
    need_invitation_letter = db.Column(db.String(10), nullable=True)
    need_airport_pickup = db.Column(db.String(10), nullable=True)
    expected_arrival_airport = db.Column(db.String(255), nullable=True)
    flight_details = db.Column(db.Text, nullable=True)

    # Consent & declarations
    media_consent = db.Column(db.String(10), nullable=True)
    code_of_conduct = db.Column(db.JSON, nullable=True)  # list of accepted items
    declaration_accepted = db.Column(db.Boolean, default=False, nullable=False)
    applicant_name_declaration = db.Column(db.String(255), nullable=True)
    signature = db.Column(db.String(255), nullable=True)
    declaration_date = db.Column(db.String(50), nullable=True)

    # Attachments (URLs)
    passport_copy_url = db.Column(db.String(500), nullable=True)
    passport_photo_url = db.Column(db.String(500), nullable=True)
    cv_url = db.Column(db.String(500), nullable=True)
    motivation_letter_url = db.Column(db.String(500), nullable=True)
    recommendation_letter_url = db.Column(db.String(500), nullable=True)
    certificates_url = db.Column(db.String(500), nullable=True)

    # Management fields
    hours_logged = db.Column(db.Float, default=0.0, nullable=False)
    status = db.Column(db.String(50), default="pending", nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # 1-5 stars
    admin_notes = db.Column(db.Text, nullable=True)
    status_message = db.Column(db.Text, nullable=True)  # message sent with last status change

    submitted_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "full_name": self.full_name,
            "gender": self.gender or "",
            "date_of_birth": self.date_of_birth or "",
            "nationality": self.nationality or "",
            "country_of_residence": self.country_of_residence or "",
            "passport_number": self.passport_number or "",
            "email": self.email,
            "phone": self.phone or "",
            "occupation": self.occupation or "",
            "organization": self.organization or "",
            "emergency_full_name": self.emergency_full_name or "",
            "emergency_relationship": self.emergency_relationship or "",
            "emergency_country": self.emergency_country or "",
            "emergency_phone": self.emergency_phone or "",
            "emergency_email": self.emergency_email or "",
            "programs": self.programs or [],
            "other_program": self.other_program or "",
            "arrival_date": self.arrival_date or "",
            "departure_date": self.departure_date or "",
            "length_of_stay": self.length_of_stay or "",
            "availability": self.availability or "",
            "educational_background": self.educational_background or "",
            "professional_experience": self.professional_experience or "",
            "technical_skills": self.technical_skills or "",
            "languages_spoken": self.languages_spoken or "",
            "previous_volunteer_experience": self.previous_volunteer_experience or "",
            "relevant_certifications": self.relevant_certifications or "",
            "motivation": self.motivation or "",
            "hope_to_learn": self.hope_to_learn or "",
            "contribution": self.contribution or "",
            "medical_conditions": self.medical_conditions or "",
            "allergies": self.allergies or "",
            "dietary_requirements": self.dietary_requirements or "",
            "emergency_medical_info": self.emergency_medical_info or "",
            "need_accommodation": self.need_accommodation or "",
            "room_preference": self.room_preference or "",
            "need_invitation_letter": self.need_invitation_letter or "",
            "need_airport_pickup": self.need_airport_pickup or "",
            "expected_arrival_airport": self.expected_arrival_airport or "",
            "flight_details": self.flight_details or "",
            "media_consent": self.media_consent or "",
            "code_of_conduct": self.code_of_conduct or [],
            "declaration_accepted": self.declaration_accepted,
            "applicant_name_declaration": self.applicant_name_declaration or "",
            "signature": self.signature or "",
            "declaration_date": self.declaration_date or "",
            "passport_copy_url": self.passport_copy_url or "",
            "passport_photo_url": self.passport_photo_url or "",
            "cv_url": self.cv_url or "",
            "motivation_letter_url": self.motivation_letter_url or "",
            "recommendation_letter_url": self.recommendation_letter_url or "",
            "certificates_url": self.certificates_url or "",
            "hours_logged": self.hours_logged,
            "status": self.status,
            "rating": self.rating,
            "admin_notes": self.admin_notes or "",
            "status_message": self.status_message or "",
            "submitted_at": self.submitted_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


# -----------------------------------------------------------------------
# ContactMessage
# -----------------------------------------------------------------------
class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "submitted_at": self.submitted_at.isoformat(),
        }
