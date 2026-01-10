"""Add unique constraint to users.email

Revision ID: 8b7c6d5e4f3a
Revises: 698b56d86bd3
Create Date: 2026-01-10 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8b7c6d5e4f3a"
down_revision: Union[str, Sequence[str], None] = "698b56d86bd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add unique constraint on users.email."""
    op.create_unique_constraint(op.f("uq_users_email"), "users", ["email"])


def downgrade() -> None:
    """Downgrade schema: drop unique constraint on users.email."""
    op.drop_constraint(op.f("uq_users_email"), "users", type_="unique")
