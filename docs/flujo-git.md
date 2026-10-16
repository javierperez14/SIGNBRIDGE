# Flujo de trabajo con Git

## Ramas

| Rama | Para qué | Quién escribe |
|---|---|---|
| `main` | Lo que se entrega/sustenta. Siempre funciona. | Solo llega por PR desde `develop` |
| `develop` | Integración: aquí se juntan los cambios del equipo | Solo llega por PR desde ramas de trabajo |
| `feat/…`, `fix/…`, `test/…`, `docs/…`, `chore/…`, `build/…`, `ci/…` | Un cambio concreto | Una persona, con su usuario |

**Nunca se hace commit directo en `main` ni en `develop`.**

## Paso a paso de un cambio

```bash
git checkout develop
git pull origin develop                 # 1. partir de lo último
git checkout -b feat/historial-por-fecha # 2. rama con prefijo y nombre claro
# ... cambios ...
git add <archivos>
git commit -m "feat(historial): filtrar traducciones por fecha"   # 3. Conventional Commits
git push -u origin feat/historial-por-fecha                       # 4. subir la rama
# 5. En GitHub: Pull request → base: develop ← compare: tu rama
# 6. Otra persona revisa (de otra capa). El CI debe quedar en verde.
# 7. Merge, y se borra la rama.
```

## Mensajes de commit (Conventional Commits)

`tipo(alcance): qué hace, en presente`

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrige un error |
| `test` | Agrega o cambia tests |
| `docs` | Solo documentación |
| `build` | Dependencias, Docker, gestores de paquetes |
| `ci` | GitHub Actions |
| `chore` | Mantenimiento que no cambia comportamiento |
| `refactor` | Reorganiza código sin cambiar comportamiento |

## Lo que nunca va al repo

- `.env` con claves reales → se sube `.env.example` con valores de mentira.
- Respaldos de la base de datos (`pg_dump`) → tienen datos personales.
- `node_modules/`, `.venv/`, `__pycache__/`, `dist/`.

Si por error subiste un secreto: **cámbialo** (la clave ya es pública aunque borres el commit) y luego quítalo del repo.
