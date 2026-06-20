"""Add YearlyTarget model

Revision ID: f3e7d2a1c4b5
Revises: 6cc94a73126b
Create Date: 2026-06-20 16:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3e7d2a1c4b5'
down_revision = '6cc94a73126b'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'yearly_targets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('trees_target', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('members_target', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('farmers_target', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sites_target', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year'),
    )


def downgrade():
    op.drop_table('yearly_targets')
