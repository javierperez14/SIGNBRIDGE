"""Tests unitarios de la traducción texto → señas LSC (app/services/traduccion.py).

Autor: @javierperez14 · Capa S2: API

La regla vive en traducir_tokens(), que recibe el diccionario por parámetro:
los tests arman un diccionario pequeño en memoria, sin base de datos.
"""
import base64
import io

import numpy as np
import pytest
from fastapi import HTTPException
from PIL import Image

from app.models.user import LexicalUnit
from app.services.traduccion import (
    _normalize_word,
    _tokenize,
    decode_base64_frame,
    traducir_tokens,
)


def seña(texto, video=None):
    """Una entrada del diccionario LSC, en memoria."""
    return LexicalUnit(id_lexicalunit=f"id-{texto}", text=texto, video_url=video or f"/media/{texto}.mp4")


DICCIONARIO = [
    seña("hola"),
    seña("buenas"),
    seña("buenas noches"),
    seña("Buenos Días"),
    seña("amigo"),
    *[seña(letra) for letra in "SOL"],  # algunas letras del alfabeto dactilológico
]


def palabras(signs):
    return [s["word"] for s in signs]


# ── _normalize_word / _tokenize ───────────────────────────────────────────────

@pytest.mark.parametrize(
    ("entrada", "esperado"),
    [("Días", "dias"), ("CANCIÓN", "cancion"), ("pingüino", "pinguino"), ("hola", "hola")],
)
def test_should_compare_words_without_accents_or_case(entrada, esperado):
    assert _normalize_word(entrada) == esperado


def test_should_split_text_into_words_and_drop_punctuation_and_numbers():
    assert _tokenize("¡Hola, amigo! ¿Vienes a las 8?") == ["Hola", "amigo", "Vienes", "a", "las"]


# ── traducir_tokens ───────────────────────────────────────────────────────────

def test_should_return_one_sign_per_known_word_in_order():
    # Arrange
    tokens = _tokenize("hola amigo")

    # Act
    signs, sin_traducir = traducir_tokens(tokens, DICCIONARIO)

    # Assert
    assert palabras(signs) == ["hola", "amigo"]
    assert all(s["found"] for s in signs)
    assert sin_traducir == []


def test_should_prefer_the_longest_phrase_over_single_words():
    # "buenas" existe sola, pero "buenas noches" es una seña distinta
    signs, _ = traducir_tokens(_tokenize("buenas noches amigo"), DICCIONARIO)

    assert palabras(signs) == ["buenas noches", "amigo"]
    assert signs[0]["id_lexicalunit"] == "id-buenas noches"


def test_should_find_a_phrase_written_without_accents_or_capitals():
    signs, _ = traducir_tokens(_tokenize("buenos dias"), DICCIONARIO)

    assert palabras(signs) == ["buenos dias"]
    assert signs[0]["found"] is True


@pytest.mark.parametrize("funcional", ["el", "la", "de", "con", "es", "que"])
def test_should_skip_function_words_that_lsc_does_not_sign(funcional):
    signs, sin_traducir = traducir_tokens(["hola", funcional, "amigo"], DICCIONARIO)

    assert palabras(signs) == ["hola", "amigo"]
    assert sin_traducir == []


def test_should_fingerspell_an_unknown_word_when_all_its_letters_exist():
    signs, sin_traducir = traducir_tokens(["sol"], DICCIONARIO)

    assert palabras(signs) == ["S", "O", "L"]
    assert sin_traducir == []


def test_should_mark_a_word_as_untranslated_when_a_letter_is_missing():
    # "luz": existe la L pero no la U ni la Z → no se puede deletrear
    signs, sin_traducir = traducir_tokens(["luz"], DICCIONARIO)

    assert sin_traducir == ["luz"]
    assert signs == [{"word": "luz", "found": False, "video_url": None, "id_lexicalunit": None}]


def test_should_ignore_dictionary_entries_without_text_when_fingerspelling():
    # LexicalUnit.text admite NULL en la base. Una fila así no debe tumbar la
    # traducción. Va PRIMERO en la lista: si fuera al final, el bucle encontraría
    # las letras antes de llegar a ella y el test pasaría sin probar nada.
    diccionario = [LexicalUnit(id_lexicalunit="id-vacia", text=None), *DICCIONARIO]

    signs, _ = traducir_tokens(["sol"], diccionario)

    assert palabras(signs) == ["S", "O", "L"]


# ── decode_base64_frame ──────────────────────────────────────────────────────

def test_should_decode_a_base64_png_into_an_rgb_array():
    buffer = io.BytesIO()
    Image.new("RGB", (4, 3), color=(255, 0, 0)).save(buffer, format="PNG")
    frame = base64.b64encode(buffer.getvalue()).decode()

    imagen = decode_base64_frame(frame)

    assert imagen.shape == (3, 4, 3)
    assert tuple(imagen[0, 0]) == (255, 0, 0)
    assert isinstance(imagen, np.ndarray)


@pytest.mark.parametrize("frame", ["no-es-base64!!", base64.b64encode(b"texto, no imagen").decode(), ""])
def test_should_reject_frames_that_are_not_images(frame):
    with pytest.raises(HTTPException) as exc:
        decode_base64_frame(frame)

    assert exc.value.status_code == 400
