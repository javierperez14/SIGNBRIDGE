"""Tests unitarios del vectorizador de la mano (app/services/abecedario_modelo.py).

Autor: @javierperez14 · Capa S2: API

_vector() convierte los 21 puntos de MediaPipe en las 83 features con las
que se entrenó el modelo del abecedario (dataset LSC70). Si cambia, el modelo
deja de reconocer letras aunque "no falle" nada.
"""
from types import SimpleNamespace

import numpy as np
import pytest

from app.services.abecedario_modelo import _vector, clasificar_letra


def mano(desplazar=(0.0, 0.0, 0.0), escalar=1.0, semilla=7):
    """21 puntos (x, y, z) de una mano cualquiera, movida y agrandada a gusto."""
    rng = np.random.default_rng(semilla)
    puntos = rng.random((21, 3)) * escalar + np.array(desplazar)
    return [SimpleNamespace(x=x, y=y, z=z) for x, y, z in puntos]


def test_should_produce_the_83_features_the_model_was_trained_with():
    vector = _vector(mano())

    # 21 puntos × 3 coordenadas + 10 distancias entre puntas + 5 + 5
    assert vector.shape == (83,)


@pytest.mark.parametrize(
    ("desplazar", "escalar"),
    [((0.3, -0.2, 0.1), 1.0), ((0, 0, 0), 2.5), ((0.5, 0.5, 0), 0.4)],
    ids=["mano-movida", "mano-mas-cerca", "mano-mas-lejos-y-movida"],
)
def test_should_give_the_same_features_wherever_the_hand_is_and_whatever_its_size(desplazar, escalar):
    # Propiedad: la misma pose debe reconocerse en cualquier parte del cuadro y a
    # cualquier distancia de la cámara (se resta la muñeca y se divide por la escala).
    base = _vector(mano())

    otra = _vector(mano(desplazar=desplazar, escalar=escalar))

    np.testing.assert_allclose(otra, base, rtol=1e-4, atol=1e-5)


def test_should_not_build_features_from_a_hand_collapsed_into_a_single_point():
    quieta = [SimpleNamespace(x=0.5, y=0.5, z=0.0)] * 21

    assert _vector(quieta) is None


@pytest.mark.parametrize("puntos", [None, [], mano()[:20]], ids=["sin-mano", "vacia", "20-puntos"])
def test_should_not_guess_a_letter_without_the_21_landmarks(puntos):
    assert clasificar_letra(puntos) == (None, None)
