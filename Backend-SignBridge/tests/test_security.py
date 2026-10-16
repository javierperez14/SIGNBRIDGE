"""Tests unitarios de app/core/security.py — contraseñas y tokens JWT.

Autor: @Lincoln1986 · Capa S2: E2E (monta el CI) + unitarias en API.

FIRST / Repeatable: la expiración del token se controla con el parámetro
`expires_delta`, nunca esperando a que pase el tiempo real.
"""
from datetime import timedelta

import jwt
import pytest
from fastapi import HTTPException

from app.core.security import (
    create_access_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_should_verify_password_against_its_own_hash():
    # Arrange
    hashed = hash_password("SignBridge2026*")

    # Act
    ok = verify_password("SignBridge2026*", hashed)

    # Assert
    assert ok is True
    assert hashed != "SignBridge2026*"  # nunca se guarda en claro


def test_should_reject_a_different_password():
    hashed = hash_password("SignBridge2026*")

    assert verify_password("signbridge2026*", hashed) is False


def test_should_return_the_subject_of_a_valid_token():
    token = create_access_token({"sub": "id-123"}, expires_delta=timedelta(minutes=5))

    payload = decode_token(token)

    assert payload["sub"] == "id-123"


# Valor límite de la expiración: 1 segundo antes de vencer es válido,
# 1 segundo después ya no. El tiempo entra por parámetro (FIRST: Repeatable).
@pytest.mark.parametrize(
    ("segundos", "valido"),
    [(60, True), (1, True), (-1, False), (-3600, False)],
)
def test_should_accept_token_only_before_it_expires(segundos, valido):
    token = create_access_token({"sub": "id-123"}, expires_delta=timedelta(seconds=segundos))

    if valido:
        assert decode_token(token)["sub"] == "id-123"
    else:
        with pytest.raises(HTTPException) as exc:
            decode_token(token)
        assert exc.value.status_code == 401


@pytest.mark.parametrize(
    "token",
    [
        jwt.encode({"sub": "id-123"}, "otra-clave-que-no-es-la-del-servidor", algorithm="HS256"),
        "esto.no.es-un-jwt",
        "",
    ],
    ids=["firmado-con-otra-clave", "texto-basura", "vacio"],
)
def test_should_reject_tokens_that_were_not_signed_by_the_server(token):
    with pytest.raises(HTTPException) as exc:
        decode_token(token)

    assert exc.value.status_code == 401


def test_should_mark_reset_tokens_with_their_type_and_email():
    token = create_reset_token("persona@example.com")

    payload = decode_token(token)

    assert payload == {"sub": "persona@example.com", "type": "reset", "exp": payload["exp"]}
