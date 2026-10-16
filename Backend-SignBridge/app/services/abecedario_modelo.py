"""Clasificación del abecedario dactilológico con modelo entrenado.

Reemplaza las reglas geométricas de `abecedario.py` por un clasificador SVM
entrenado sobre el dataset LSC70 de la Universidad del Cauca (70 voluntarios,
DOI 10.17632/9ssyn8tff5.2).

Precisión medida: 91.5 % sobre 14 personas que el modelo nunca vio durante
el entrenamiento.

Mantiene exactamente la misma firma que `abecedario.clasificar_letra`, así que
el resto del backend no cambia.

No reconoce Ñ ni H: en LSC ambas se realizan con movimiento y son
indistinguibles desde un solo frame.
"""

import logging
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

RUTA_MODELO = Path(__file__).resolve().parents[1] / "ml" / "modelo_abecedario.pkl"

UMBRAL_CONFIANZA = 0.55

TIPS = [4, 8, 12, 16, 20]
MCP = [2, 5, 9, 13, 17]

_modelo = None
_letras = None


def _cargar():
    global _modelo, _letras
    if _modelo is not None:
        return True
    if not RUTA_MODELO.exists():
        logger.error("No se encuentra el modelo en %s", RUTA_MODELO)
        return False
    try:
        import joblib
        paquete = joblib.load(RUTA_MODELO)
        _modelo = paquete["modelo"]
        _letras = paquete["letras"]
        logger.info("Modelo de abecedario cargado (%s, %d letras)",
                    paquete.get("tipo", "?"), len(_letras))
        return True
    except Exception:
        logger.exception("Fallo al cargar el modelo de abecedario")
        return False


def _vector(landmarks) -> Optional[np.ndarray]:
    """Convierte 21 landmarks en las mismas 83 features del entrenamiento."""
    pts = np.array([[lm.x, lm.y, lm.z] for lm in landmarks], dtype=np.float32)
    pts = pts - pts[0]
    escala = np.linalg.norm(pts, axis=1).max()
    if escala < 1e-6:
        return None
    pts = pts / escala

    extra = []
    for i in range(5):
        for j in range(i + 1, 5):
            extra.append(np.linalg.norm(pts[TIPS[i]] - pts[TIPS[j]]))
    for i in range(5):
        extra.append(np.linalg.norm(pts[TIPS[i]] - pts[0]))
        extra.append(np.linalg.norm(pts[TIPS[i]] - pts[MCP[i]]))

    return np.concatenate([pts.flatten(), np.array(extra, dtype=np.float32)])


def clasificar_letra(landmarks) -> Tuple[Optional[str], Optional[float]]:
    if landmarks is None or len(landmarks) < 21:
        return None, None
    if not _cargar():
        return None, None

    vec = _vector(landmarks)
    if vec is None:
        return None, None

    try:
        probas = _modelo.predict_proba(vec.reshape(1, -1))[0]
    except Exception:
        logger.exception("Fallo al predecir la letra")
        return None, None

    i = int(np.argmax(probas))
    confianza = float(probas[i])
    if confianza < UMBRAL_CONFIANZA:
        return None, None
    return str(_letras[i]), round(confianza, 3)


def esta_disponible() -> bool:
    return _cargar()
