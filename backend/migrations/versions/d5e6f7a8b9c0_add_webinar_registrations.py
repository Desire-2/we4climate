"""add webinar_registrations table

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa

revision = "d5e6f7a8b9c0"
down_revision = "c4d5e6f7a8b9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "webinar_registrations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("webinar_id", sa.Integer(), sa.ForeignKey("webinars.id"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("registered_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("webinar_id", "email", name="uq_webinar_email"),
    )


def downgrade() -> None:
    op.drop_table("webinar_registrations")
