"""baseline: esquema inicial de SignBridge

Reproduce EXACTAMENTE la base que el equipo ya tiene (17 tablas, 4 vistas,
2 funciones y 15 triggers), tomada del respaldo con pg_dump --schema-only.

Si la base ya tiene las tablas (la de desarrollo de cada integrante), no
crea nada: solo queda marcada en esta versión. Así `alembic upgrade head`
sirve igual en una base vacía y en una que ya tiene datos.

Revision ID: 0001
Revises:
Create Date: 2026-10-15
"""
from collections.abc import Sequence
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SQL = Path(__file__).resolve().parent.parent / "sql" / "0001_baseline.sql"

TABLAS = [
    "AccessLog", "DeviceConfiguration", "FavoriteWords", "Feedback", "LexicalUnit",
    "Message", "Notification", "Region", "Role", "SignAvatarConfig", "SignInput",
    "Support", "SystemErrorLog", "TranslationDetail", "TranslationSession", "User",
    "VoiceInput",
]
VISTAS = ["vw_admin_dashboard", "vw_system_statistics", "vw_user_dashboard", "vw_users"]


def upgrade() -> None:
    bind = op.get_bind()
    if "User" in sa.inspect(bind).get_table_names():
        # Base existente: el esquema ya está, solo se registra la versión.
        return
    # exec_driver_sql manda el archivo tal cual a psycopg2, que acepta
    # varias sentencias y los bloques $$ ... $$ de las funciones.
    bind.exec_driver_sql(SQL.read_text(encoding="utf-8"))


def downgrade() -> None:
    for vista in VISTAS:
        op.execute(f'DROP VIEW IF EXISTS public."{vista}" CASCADE')
    for tabla in TABLAS:
        op.execute(f'DROP TABLE IF EXISTS public."{tabla}" CASCADE')
    op.execute("DROP FUNCTION IF EXISTS public.fn_assign_region_by_city() CASCADE")
    op.execute("DROP FUNCTION IF EXISTS public.fn_set_updated_at() CASCADE")
