"""seed: catálogos que la app necesita para funcionar

Roles (Administrador, Cliente, Soporte), regiones de Colombia y las
unidades léxicas LSC con la ruta de su video en media/videos/.

Usa ON CONFLICT DO NOTHING: si la fila ya existe (misma llave), la deja
como está. No inserta usuarios: los demo están en Base-de-datos/04-scripts-dml.sql.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-15
"""
from collections.abc import Sequence
from pathlib import Path

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SQL = Path(__file__).resolve().parent.parent / "sql" / "0002_catalogos.sql"


def upgrade() -> None:
    op.get_bind().exec_driver_sql(SQL.read_text(encoding="utf-8"))


def downgrade() -> None:
    # Los catálogos se quedan: borrarlos rompería las llaves de User y Feedback.
    pass
