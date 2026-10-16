# Auditoría de vulnerabilidades en dependencias

Pedido del instructor: revisar que las librerías que usamos no tengan vulnerabilidades conocidas. Se hace con dos herramientas, una por stack, y el CI las corre en cada PR.

## Cómo correrla

```bash
# Frontend
cd Frontend-SignBridge
pnpm audit

# Backend
cd Backend-SignBridge
uv export --no-dev --format requirements-txt --no-hashes > /tmp/req.txt
uv run pip-audit -r /tmp/req.txt --no-deps --disable-pip
```

## Resultado de la auditoría inicial (2026-10-15)

| Stack | Antes | Después |
|---|---|---|
| Frontend (`pnpm audit`) | 42 (22 altas, 20 moderadas) | **0** |
| Backend (`pip-audit`) | 9 paquetes, 43 avisos | **1 aceptado** (ver abajo) |

### Qué se cambió

| Paquete | Antes | Después | Cómo |
|---|---|---|---|
| axios | 1.17.0 | 1.20.0 | directa |
| react-router-dom | 7.17.0 | 7.18.4 | directa |
| vite | 8.0.16 | 8.3.4 | directa (arregla postcss, nanoid, source-map-js) |
| eslint | 10.4.1 | 10.12.0 | directa |
| brace-expansion, browserslist, baseline-browser-mapping | — | parche | `overrides` en `pnpm-workspace.yaml` |
| fastapi | 0.111.0 | 0.143.0 | directa |
| starlette | 0.37.2 | 1.5.0 | se fija aparte (la trae fastapi) |
| python-jose | 3.3.0 | **eliminado** | reemplazado por **PyJWT 2.15.1**: jose tiene avisos sin parche |
| python-multipart | 0.0.9 | 0.0.31 | directa |
| pydantic | 2.7.1 | 2.12.5 | directa (la exige fastapi nuevo) |
| aiosmtplib | 3.0.1 | 5.1.2 | directa |
| jinja2 | 3.1.4 | 3.1.6 | directa |
| python-dotenv | 1.0.1 | 1.2.2 | directa |
| Pillow | 10.3.0 | 12.3.0 | directa |

> Regla usada: versiones publicadas hace al menos una semana. Una versión recién salida puede venir comprometida (ataques a la cadena de suministro) y todavía nadie lo ha notado.

## Riesgos aceptados

| Aviso | Paquete | Por qué se acepta | Cuándo se revisa |
|---|---|---|---|
| `PYSEC-2026-1805` / CVE-2026-0994 | protobuf 4.25.9 | Lo trae **mediapipe 0.10.14**, que exige `protobuf<5`. El fallo es un DoS en `json_format.ParseDict()` con mensajes `Any` anidados. La app **no** procesa protobuf que venga del usuario. Para quitarlo hay que subir mediapipe, que cambió su API (`mediapipe.solutions`), y eso necesita su propia rama con pruebas del reconocimiento del abecedario | Cuando se migre MediaPipe |

En el CI este aviso se ignora **por su ID** (`--ignore-vuln PYSEC-2026-1805`). Cualquier aviso nuevo hace fallar el job.
