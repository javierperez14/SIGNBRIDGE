"""Tests unitarios de las validaciones de datos antes de llegar a la BD.

Autor: @Sebas-p-s · Capa S2: BD

Son las reglas de los schemas de Pydantic: lo que la API acepta o rechaza
antes de escribir en User, Feedback y Support.
"""
import pytest
from pydantic import ValidationError

from app.schemas.auth import UserRegister, _validate_strong_password
from app.schemas.feedback import FeedbackCreate
from app.schemas.support import SupportCreate, SupportStatusUpdate

REGISTRO_VALIDO = {
    "first_name": "ana",
    "last_name": "pérez",
    "phone": "3001234567",
    "city": "Bogotá",
    "address": "Cra 10 # 20-30",
    "email": "ana@example.com",
    "password": "SignBridge2026*",
}


def registro(**cambios):
    return UserRegister(**{**REGISTRO_VALIDO, **cambios})


# ── User: contraseña segura ───────────────────────────────────────────────────

@pytest.mark.parametrize(
    ("password", "error"),
    [
        ("Abcde1*", "Debe tener al menos 8 caracteres"),        # 7: justo debajo del borde
        ("abcdef1*", "Debe incluir al menos una letra mayúscula"),
        ("ABCDEF1*", "Debe incluir al menos una letra minúscula"),
        ("Abcdefg*", "Debe incluir al menos un número"),
        ("Abcdefg1", "Debe incluir al menos un carácter especial (!@#$%...)"),
    ],
)
def test_should_explain_which_password_rule_is_broken(password, error):
    assert _validate_strong_password(password) == [error]


def test_should_accept_a_password_of_exactly_eight_characters():
    assert _validate_strong_password("Abcdef1*") == []


def test_should_count_spanish_letters_as_letters_not_as_special_characters():
    # "ñ" y las tildes cuentan como minúsculas, NO como carácter especial.
    # Ojo: el frontend las contaba como especiales (ver PR del arreglo).
    assert _validate_strong_password("Contraseña1") == [
        "Debe incluir al menos un carácter especial (!@#$%...)"
    ]


# ── User: teléfono y nombres ──────────────────────────────────────────────────

@pytest.mark.parametrize(
    ("telefono", "guardado"),
    [("3001234567", "3001234567"), ("300 123 4567", "3001234567"), ("(300) 123-4567", "3001234567")],
)
def test_should_store_only_the_ten_digits_of_the_phone(telefono, guardado):
    assert registro(phone=telefono).phone == guardado


@pytest.mark.parametrize(
    ("telefono", "mensaje"),
    [
        ("300123456", "exactamente 10 dígitos"),   # 9
        ("30012345678", "exactamente 10 dígitos"), # 11
        ("2001234567", "debe empezar con 3"),
    ],
)
def test_should_reject_phones_that_are_not_colombian_mobiles(telefono, mensaje):
    with pytest.raises(ValidationError, match=mensaje):
        registro(phone=telefono)


def test_should_capitalize_names_and_trim_spaces():
    usuario = registro(first_name="  maría josé ", last_name="de la peña")

    assert (usuario.first_name, usuario.last_name) == ("María José", "De La Peña")


@pytest.mark.parametrize("campo", ["first_name", "last_name", "address"])
def test_should_reject_required_fields_with_only_spaces(campo):
    with pytest.raises(ValidationError, match="obligatori"):
        registro(**{campo: "   "})


# ── Feedback: calificación ────────────────────────────────────────────────────

@pytest.mark.parametrize(("rating", "valido"), [(0, False), (1, True), (5, True), (6, False)])
def test_should_accept_ratings_only_from_one_to_five(rating, valido):
    if valido:
        assert FeedbackCreate(id_lexicalunit="id-hola", rating=rating).rating == rating
    else:
        with pytest.raises(ValidationError, match="entre 1 y 5"):
            FeedbackCreate(id_lexicalunit="id-hola", rating=rating)


@pytest.mark.parametrize(("largo", "valido"), [(1000, True), (1001, False)])
def test_should_limit_feedback_comments_to_1000_characters(largo, valido):
    comentario = "a" * largo
    if valido:
        assert len(FeedbackCreate(id_session="s1", rating=4, comment=comentario).comment) == 1000
    else:
        with pytest.raises(ValidationError, match="1000 caracteres"):
            FeedbackCreate(id_session="s1", rating=4, comment=comentario)


def test_should_require_a_session_or_a_word_to_attach_the_feedback_to():
    with pytest.raises(ValidationError, match="id_session o id_lexicalunit"):
        FeedbackCreate(rating=4)


# ── Support: tickets ──────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    ("campo", "limite"),
    [("subject", 150), ("message", 3000)],
)
def test_should_enforce_the_maximum_length_of_tickets(campo, limite):
    base = {"subject": "Asunto", "message": "Mensaje"}

    assert len(getattr(SupportCreate(**{**base, campo: "x" * limite}), campo)) == limite
    with pytest.raises(ValidationError, match=f"{limite} caracteres"):
        SupportCreate(**{**base, campo: "x" * (limite + 1)})


@pytest.mark.parametrize("solucion", [None, "", "   "])
def test_should_not_resolve_a_ticket_without_a_solution(solucion):
    with pytest.raises(ValidationError, match="debe escribir la solución"):
        SupportStatusUpdate(status="resolved", solution=solucion)


@pytest.mark.parametrize("estado", ["pending", "in_progress", "closed"])
def test_should_allow_other_statuses_without_a_solution(estado):
    assert SupportStatusUpdate(status=estado).solution is None


def test_should_reject_unknown_ticket_statuses():
    with pytest.raises(ValidationError):
        SupportStatusUpdate(status="archivado")
