"""Configuración común de pytest.

Los tests unitarios NO usan el .env de desarrollo ni una base de datos:
fijan aquí valores de prueba antes de que se importe la app. Así corren
igual en cualquier equipo y en el CI.
"""
import os

os.environ.update(
    {
        # create_engine no se conecta hasta la primera consulta: los tests
        # unitarios nunca la hacen, así que esta URL no necesita existir.
        "DATABASE_URL": "postgresql://test:test@localhost:5432/signbridge_test",
        "SECRET_KEY": "clave-solo-para-tests-0123456789abcdef",
        "ALGORITHM": "HS256",
        "MAIL_USERNAME": "test",
        "MAIL_PASSWORD": "test",
        "MAIL_FROM": "test@example.com",
    }
)
