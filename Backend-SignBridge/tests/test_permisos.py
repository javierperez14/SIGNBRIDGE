"""Tests unitarios de los permisos por rol (app/core/security.py).

Autor: @javierperez14 · Capa S2: API

Las dependencias require_* deciden quién puede usar cada endpoint. Aquí se
prueban solas, con usuarios y una sesión de BD falsos (sin base de datos).
"""
from datetime import timedelta
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import (
    create_access_token,
    get_current_user,
    require_admin,
    require_support,
    require_support_or_admin,
)


def usuario(rol, activo=True):
    return SimpleNamespace(id_user="u1", is_active=activo, role=SimpleNamespace(role_name=rol))


# ── Roles ─────────────────────────────────────────────────────────────────────

ROLES = ["Administrador", "admin", "Soporte", "soporte", "Cliente"]


@pytest.mark.parametrize(
    ("guardia", "permitidos"),
    [
        # Gestionar usuarios: solo Administrador
        (require_admin, {"Administrador", "admin"}),
        # VER tickets y valoraciones: Soporte y Administrador
        (require_support_or_admin, {"Administrador", "admin", "Soporte", "soporte"}),
        # RESOLVER tickets y responder valoraciones: solo Soporte (el Admin no)
        (require_support, {"Soporte", "soporte"}),
    ],
    ids=["require_admin", "require_support_or_admin", "require_support"],
)
@pytest.mark.parametrize("rol", ROLES)
def test_should_let_in_only_the_allowed_roles(guardia, permitidos, rol):
    persona = usuario(rol)

    if rol in permitidos:
        assert guardia(current_user=persona) is persona
    else:
        with pytest.raises(HTTPException) as exc:
            guardia(current_user=persona)
        assert exc.value.status_code == 403


# ── get_current_user ──────────────────────────────────────────────────────────

class SesionFalsa:
    """Imita db.query(User).filter(...).first() devolviendo un usuario fijo."""

    def __init__(self, encontrado):
        self.encontrado = encontrado

    def query(self, *_):
        return self

    def filter(self, *_):
        return self

    def first(self):
        return self.encontrado


def credenciales(payload):
    token = create_access_token(payload, expires_delta=timedelta(minutes=5))
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def test_should_return_the_active_user_of_the_token():
    persona = usuario("Cliente")

    assert get_current_user(credenciales({"sub": "u1"}), SesionFalsa(persona)) is persona


@pytest.mark.parametrize(
    ("payload", "encontrado", "codigo", "detalle"),
    [
        ({"rol": "x"}, usuario("Cliente"), 401, "Token inválido"),           # token sin "sub"
        ({"sub": "u-borrado"}, None, 401, "Usuario no encontrado"),          # borrado o inexistente
        ({"sub": "u1"}, usuario("Cliente", activo=False), 403, "Cuenta desactivada"),
    ],
    ids=["sin-sub", "no-existe", "desactivado"],
)
def test_should_reject_tokens_of_users_that_cannot_log_in(payload, encontrado, codigo, detalle):
    with pytest.raises(HTTPException) as exc:
        get_current_user(credenciales(payload), SesionFalsa(encontrado))

    assert (exc.value.status_code, exc.value.detail) == (codigo, detalle)
