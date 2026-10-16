# SignBridge

> "Un lugar para comunicarse" — traducción entre voz/texto y Lengua de Señas Colombiana (LSC).

Proyecto formativo SENA · ADSO. Monorepo con:

| Carpeta | Qué es |
|---|---|
| `Backend-SignBridge/` | API REST con FastAPI + PostgreSQL |
| `Frontend-SignBridge/` | SPA con React + Vite + TypeScript |
| `docker-compose.yml` | Levanta PostgreSQL, backend y frontend |

## Arranque rápido

```bash
cp .env.example .env        # cambia SECRET_KEY y las credenciales
docker compose up -d --build
```

- Frontend → http://localhost:5173
- API docs → http://localhost:8000/docs
