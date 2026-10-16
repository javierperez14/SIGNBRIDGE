# SignBridge

> "Un lugar para comunicarse" — traducción entre voz/texto y Lengua de Señas Colombiana (LSC).

Proyecto formativo SENA · ADSO. Monorepo con:

| Carpeta | Qué es |
|---|---|
| `Backend-SignBridge/` | API REST con FastAPI + PostgreSQL |
| `Frontend-SignBridge/` | SPA con React + Vite + TypeScript |
| `docker-compose.yml` | Levanta PostgreSQL, backend y Nginx (con el frontend compilado) |

## Arranque rápido

```bash
cp .env.example .env        # cambia SECRET_KEY y las credenciales
docker compose up -d --build
```

- App (Nginx) → http://localhost:8080
- API docs → http://localhost:8080/api/docs

### Cómo se conectan los contenedores

```
navegador ──► web (Nginx :8080) ──[red_frontend]──► backend ──[red_datos]──► postgres
                 │ /       → React compilado
                 └ /api/*  → backend:8000
```

Nginx no puede ver la base de datos y Postgres solo escucha en `127.0.0.1` (para DBeaver).

### Desarrollo del frontend con recarga en caliente

```bash
docker compose up -d postgres backend
cd Frontend-SignBridge && pnpm dev     # http://localhost:5173 → API en localhost:8000
```

## Pruebas

| Capa | Dónde | Comando |
|---|---|---|
| Unitarias frontend (Vitest + cobertura) | `Frontend-SignBridge/src/**/*.test.ts(x)` | `cd Frontend-SignBridge && pnpm test` |
| Unitarias backend (pytest + cobertura) | `Backend-SignBridge/tests/` | `cd Backend-SignBridge && uv run pytest` |
| E2E (Playwright) | `e2e/tests/` | ver [`e2e/README.md`](e2e/README.md) |

La cobertura se mide en cada corrida y el comando **falla** si baja del umbral. El historial está en [`docs/matriz-rotacion.md`](docs/matriz-rotacion.md).

Documentación del equipo: [flujo de Git](docs/flujo-git.md) · [auditoría de dependencias](docs/seguridad-dependencias.md) · [base de datos](Base-de-datos/README.md)
