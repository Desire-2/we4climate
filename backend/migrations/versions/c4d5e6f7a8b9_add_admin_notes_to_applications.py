"""Add admin_notes to applications

Revision ID: c4d5e6f7a8b9
Revises: a26889b0b99a
Create Date: 2026-08-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7a8b9'
down_revision = 'f209f15b790e'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = {col["name"] for col in inspector.get_columns("applications")}

    with op.batch_alter_table('applications', schema=None) as batch_op:
        if 'admin_notes' not in existing:
            batch_op.add_column(sa.Column('admin_notes', sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table('applications', schema=None) as batch_op:
        batch_op.drop_column('admin_notes')
