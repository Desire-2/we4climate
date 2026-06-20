"""
Marshmallow schemas for request validation and response serialization.
"""
from marshmallow import Schema, fields, validate, ValidationError


# -----------------------------------------------------------------------
# Pledge schemas
# -----------------------------------------------------------------------
class PledgeSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    district = fields.String(required=True, validate=validate.Length(min=1, max=255))
    trees_count = fields.Integer(
        required=True, validate=validate.Range(min=1, max=100000)
    )
    tree_type = fields.String(required=True, validate=validate.Length(min=1, max=255))
    timestamp = fields.DateTime(dump_only=True)


class PledgeResponseSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String()
    district = fields.String()
    trees_count = fields.Integer()
    tree_type = fields.String()
    timestamp = fields.DateTime()


# -----------------------------------------------------------------------
# Certificate schemas
# -----------------------------------------------------------------------
class CertificateRequestSchema(Schema):
    recipient_name = fields.String(
        required=True, validate=validate.Length(min=1, max=255)
    )
    recipient_email = fields.Email(
        required=True, validate=validate.Length(min=1, max=255)
    )
    score = fields.Integer(required=True, validate=validate.Range(min=1, max=3))


class CertificateResponseSchema(Schema):
    id = fields.Integer(dump_only=True)
    recipient_name = fields.String()
    recipient_email = fields.String()
    score = fields.Integer()
    certificate_code = fields.String()
    issued_at = fields.DateTime()


# -----------------------------------------------------------------------
# Opportunity schemas
# -----------------------------------------------------------------------
class OpportunityRequestSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    type = fields.String(
        required=True,
        validate=validate.OneOf(["Job", "Internship", "Volunteer", "Workshop"]),
    )
    location = fields.String(required=True, validate=validate.Length(min=1, max=255))
    deadline = fields.String(allow_none=True, validate=validate.Length(max=100))
    description = fields.String(required=True, validate=validate.Length(min=10, max=5000))
    requirements = fields.List(fields.String(), required=False, load_default=[])
    is_external = fields.Boolean(required=False, load_default=False)
    external_url = fields.String(allow_none=True, validate=validate.Length(max=500))
    is_active = fields.Boolean(required=False, load_default=True)


# -----------------------------------------------------------------------
# Application schemas
# -----------------------------------------------------------------------
class ApplicationRequestSchema(Schema):
    opportunity_id = fields.String(
        required=True, validate=validate.Length(min=1, max=50)
    )
    applicant_name = fields.String(
        required=True, validate=validate.Length(min=1, max=255)
    )
    applicant_email = fields.Email(
        required=True, validate=validate.Length(min=1, max=255)
    )
    resume_url = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=500),
    )
    cover_letter = fields.String(
        required=False,
        allow_none=True,
    )


# -----------------------------------------------------------------------
# Weekly Challenge schemas
# -----------------------------------------------------------------------
class QuestionSchema(Schema):
    text = fields.String(required=True, validate=validate.Length(min=1))
    options = fields.List(fields.String(), required=True, validate=validate.Length(min=2))
    correct = fields.Integer(required=True, validate=validate.Range(min=0))
    explanation = fields.String(required=True, validate=validate.Length(min=1))


class WeeklyChallengeRequestSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    week_start = fields.Date(required=True)
    week_end = fields.Date(required=True)
    questions = fields.List(
        fields.Nested(QuestionSchema),
        required=True,
        validate=validate.Length(min=1, max=20),
    )
    is_active = fields.Boolean(required=False, load_default=False)


# -----------------------------------------------------------------------
# Webinar schemas
# -----------------------------------------------------------------------
class WebinarRequestSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    speaker = fields.String(required=True, validate=validate.Length(min=1, max=255))
    speaker_title = fields.String(allow_none=True, validate=validate.Length(max=255))
    date = fields.String(required=True, validate=validate.Length(min=1, max=100))
    time = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String(required=True, validate=validate.Length(min=10, max=5000))
    max_capacity = fields.Integer(allow_none=True, validate=validate.Range(min=1))
    is_active = fields.Boolean(required=False, load_default=True)


# -----------------------------------------------------------------------
# Contact schemas
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# Impact Story schemas
# -----------------------------------------------------------------------
class ImpactStoryRequestSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    quote = fields.String(required=True, validate=validate.Length(min=10, max=5000))
    initials = fields.String(allow_none=True, validate=validate.Length(max=10))
    district_name = fields.String(allow_none=True, validate=validate.Length(max=255))
    is_active = fields.Boolean(required=False, load_default=True)
    sort_order = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))


# -----------------------------------------------------------------------
# District Metric enhancement schema
# -----------------------------------------------------------------------
class DistrictMetricRequestSchema(Schema):
    district_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    province = fields.String(required=True, validate=validate.Length(min=1, max=100))
    province_key = fields.String(required=True, validate=validate.OneOf(["west", "north", "east", "south", "kigali"]))
    description = fields.String(allow_none=True, load_default="")
    species = fields.List(fields.String(), required=False, load_default=[])
    map_coords_x = fields.Float(required=False, load_default=50.0, validate=validate.Range(min=0, max=100))
    map_coords_y = fields.Float(required=False, load_default=50.0, validate=validate.Range(min=0, max=100))
    trees_planted = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    community_members = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    farmers_trained = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    active_sites = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))


# -----------------------------------------------------------------------
# Yearly Target schemas
# -----------------------------------------------------------------------
class YearlyTargetRequestSchema(Schema):
    year = fields.Integer(required=True, validate=validate.Range(min=2020, max=2100))
    trees_target = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    members_target = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    farmers_target = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    sites_target = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))


# -----------------------------------------------------------------------
# Impact Goal schemas
# -----------------------------------------------------------------------
class ImpactGoalRequestSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    description = fields.String(required=True, validate=validate.Length(min=10, max=5000))
    icon = fields.String(required=False, load_default="Sparkles", validate=validate.Length(max=50))
    milestone = fields.String(required=True, validate=validate.Length(min=1, max=255))
    action_details = fields.String(allow_none=True, validate=validate.Length(max=5000))
    sort_order = fields.Integer(required=False, load_default=0, validate=validate.Range(min=0))
    is_active = fields.Boolean(required=False, load_default=True)


class ContactRequestSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    email = fields.Email(required=True, validate=validate.Length(min=1, max=255))
    subject = fields.String(required=True, validate=validate.Length(min=1, max=255))
    message = fields.String(
        required=True, validate=validate.Length(min=10, max=5000)
    )
