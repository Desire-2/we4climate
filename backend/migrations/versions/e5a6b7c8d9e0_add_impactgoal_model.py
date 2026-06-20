"""Add ImpactGoal model

Revision ID: e5a6b7c8d9e0
Revises: f3e7d2a1c4b5
Create Date: 2026-06-20 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5a6b7c8d9e0'
down_revision = 'f3e7d2a1c4b5'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'impact_goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=False, server_default='Sparkles'),
        sa.Column('milestone', sa.String(length=255), nullable=False),
        sa.Column('action_details', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('impact_goals')
