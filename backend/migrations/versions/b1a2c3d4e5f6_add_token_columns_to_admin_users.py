"""Add token columns to admin_users

Revision ID: b1a2c3d4e5f6
Revises: 6cc94a73126b
Create Date: 2026-08-16
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "b1a2c3d4e5f6"
down_revision = "e5a6b7c8d9e0"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("admin_users", sa.Column("token", sa.String(256), nullable=True))
    op.add_column("admin_users", sa.Column("token_created_at", sa.DateTime(), nullable=True))
    op.create_unique_constraint("uq_admin_users_token", "admin_users", ["token"])


def downgrade():
    op.drop_constraint("uq_admin_users_token", "admin_users", type_="unique")
    op.drop_column("admin_users", "token_created_at")
    op.drop_column("admin_users", "token")
