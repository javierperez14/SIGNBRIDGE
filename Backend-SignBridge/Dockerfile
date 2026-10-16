FROM python:3.12-slim

# uv (Astral) instala exactamente lo que dice uv.lock: mismo resultado en
# cualquier máquina. La versión va fija, igual que las dependencias.
COPY --from=ghcr.io/astral-sh/uv:0.11.32 /uv /uvx /bin/

WORKDIR /app

# Librerías del sistema que necesita MediaPipe para importarse.
#
# Sin ellas el paquete se instala pero falla al importar con
# "libGL.so.1: cannot open shared object file". Como el import está dentro de
# un try/except, la app arranca igual y la detección de señas cae en silencio
# al modo simulado, que es difícil de diagnosticar.
#
#   libgl1          → OpenGL, que usa OpenCV (dependencia de MediaPipe)
#   libglib2.0-0    → GLib, requerida por el mismo OpenCV
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libgl1 \
      libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# El entorno virtual vive FUERA de /app: así el volumen de docker compose
# (./Backend-SignBridge:/app) no lo tapa en desarrollo.
ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/opt/venv/bin:$PATH"

# Primero solo los archivos de dependencias: Docker reutiliza esta capa
# mientras no cambien, y el build es mucho más rápido.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
