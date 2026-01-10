"""Create projects table

Revision ID: 698b56d86bd3
Revises: c87ebd3e315c
Create Date: 2026-01-06 22:13:45.349632

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "698b56d86bd3"
down_revision: Union[str, Sequence[str], None] = "c87ebd3e315c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # This migration previously attempted to create tables that were
    # already created by earlier migrations. Keep as a no-op to avoid
    # DuplicateTableError when applying migrations to existing databases.
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # No-op: this migration was consolidated with an earlier migration
    # that handled the creation / dropping of `projects`.
    pass
