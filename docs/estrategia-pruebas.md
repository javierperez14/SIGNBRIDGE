# Estrategia de pruebas — SignBridge

**Grupo**: @javierperez14, @juan-soto350, @Sebas-p-s, @Lincoln1986 · **Ficha**: 3228973 B · **Stack**: React + FastAPI + PostgreSQL · **Fecha**: 2026-10-15 (cierre de la semana 2)

## 1. Qué hace la app y qué no puede fallar

SignBridge traduce texto y voz en español a Lengua de Señas Colombiana (LSC), reconoce el abecedario dactilológico con la cámara y conecta a la persona con Soporte. La usan personas sordas y oyentes: si la traducción o el acceso fallan, la comunicación se corta.

| Riesgo | Por qué importa |
|---|---|
| La traducción muestra señas equivocadas o no encuentra frases ("buenas noches") | Es la función principal: se comunica algo distinto a lo que se quiso decir |
| No se puede entrar, o un error de contraseña no se explica | La persona queda fuera de la app sin saber por qué |
| Un rol hace lo que no debe (Admin resolviendo tickets, Cliente en el panel) | Rompe la regla del equipo y expone datos de otros usuarios |
| Formularios que aceptan datos que la API rechaza | La persona ve "todo bien" y luego un error sin sentido |
| Una dependencia con vulnerabilidad conocida | El servidor queda expuesto |

## 2. Qué prueba cada capa y por qué

| Capa | Qué verifica | Herramienta | Tests |
|---|---|---|---|
| Unitarias backend | Traducción (frases, palabras omitidas, deletreo), permisos por rol, JWT, validaciones de User/Feedback/Support, vectorizador del modelo | pytest + pytest-cov | 92 |
| Unitarias frontend | Reglas de formularios y contraseña, fechas relativas, URLs de video, colores del ranking, ajustes de accesibilidad, decisión de cerrar sesión ante un 401 | Vitest | ~120 |
| Contrato front→back | Que cada función del cliente llame a la ruta y método que expone FastAPI (47 rutas) | Vitest | 60+ |
| Componentes React | Login/registro/recuperar, rutas protegidas por rol, campana de avisos, Voz a Señas, accesibilidad | React Testing Library | ~55 |
| API | — (semana 4) | | 0 |
| Integración con BD | Migraciones: upgrade/downgrade probados a mano (semana 6 en CI) | Alembic | — |
| E2E (flujos críticos) | Login válido, login con contraseña incorrecta, validación del registro, traducir "hola amigo" | Playwright | 4 |

**Por qué esta forma**: la lógica de negocio de SignBridge vive en dos lugares, el servicio de traducción del backend y los formularios del frontend. Por eso la base de la suite son unitarias en esas dos partes. Para poder probarla se separó primero de la BD (`traducir_tokens`) y de los componentes (`src/utils`). Los 4 E2E cubren los flujos en los que, si algo falla, la persona no puede usar la app.

## 3. Qué no se prueba y por qué

| Fuera de la suite o de la cobertura | Motivo |
|---|---|
| `src/main.tsx`, `app/main.py` | Solo arrancan la app (registran rutas y middlewares) |
| Reconocimiento real con MediaPipe | Requiere cámara y el modelo de MediaPipe; se prueba el vectorizador con puntos sintéticos |
| Envío real de correos | Mailtrap es externo; se probará con un doble en la semana 5 |
| Paneles de Admin/Soporte/Usuario (páginas grandes) | Pendientes para la semana 3 (componentes) |

## 4. Datos y entornos

- Las **unitarias no usan base de datos**: `tests/conftest.py` fija variables de prueba y los servicios reciben el diccionario o una sesión falsa por parámetro.
- La hora actual **entra por parámetro** (`tiempoRelativo(iso, ahora)`, `expires_delta`): ningún test depende del reloj.
- En el frontend, la API, la cámara y el reconocimiento de voz se reemplazan por dobles.
- Los **E2E** usan los usuarios demo de `Base-de-datos/04-scripts-dml.sql` (`*.demo@example.com`, contraseña `SignBridge2026*`) contra el backend en Docker.

## 5. CI y umbrales

- Workflow: [`.github/workflows/tests.yml`](../.github/workflows/tests.yml), con los jobs `frontend`, `backend` y `auditoria`, en cada PR y en cada push a `main`/`develop`.
- Jobs obligatorios en el ruleset: `frontend (lint + build + vitest)`, `backend (pytest)`, `auditoría de dependencias`.

| Parte | Cobertura actual (S2) | Umbral configurado |
|---|---|---|
| Frontend | 34,04 % líneas | líneas 34 · sentencias 32 · funciones 27 · ramas 27 |
| Backend | 31,60 % | 31 |

Meta del bootcamp: **80 % en la semana 8**.

## 6. Hallazgos y riesgos conocidos

| Defecto | Capa que lo encontró | Estado |
|---|---|---|
| Con contraseña incorrecta la página se recargaba y no mostraba el error (interceptor 401) | E2E | Corregido (PR #8) |
| Eliminar la cuenta con contraseña equivocada sacaba a la persona de la app | E2E (mismo origen) | Corregido (PR #8) |
| Los campos de formulario no tenían `<label>` asociado (accesibilidad) | E2E | Corregido (PR #7) |
| Una seña con `text` NULL en el diccionario tumbaba el deletreo (500) | Unitarias API | Corregido (PR #13) |
| Front y back con reglas de contraseña distintas (`ñ` contada como especial) | Unitarias BD | Corregido (PR #15) |
| `pnpm build` fallaba por errores de tipos | CI/build | Corregido (PR #2) |
| 42 vulnerabilidades en el frontend y 9 paquetes vulnerables en el backend | Auditoría | Corregido (PR #6) |
| protobuf 4.25.9 (CVE-2026-0994), fijado por mediapipe 0.10.14 | Auditoría | Riesgo aceptado, ver [seguridad-dependencias.md](seguridad-dependencias.md) |
| Palabras duplicadas en `LexicalUnit` (`Adiós`/`adios`) y relaciones sin `FOREIGN KEY` | Revisión del esquema | Abierto |

## 7. Evidencia individual

| Integrante | Capas trabajadas (matriz) | Tests de la semana 2 |
|---|---|---|
| @javierperez14 | S1 E2E · S2 API | `test_traduccion.py`, `test_permisos.py`, `test_abecedario_modelo.py` |
| @juan-soto350 | S1 E2E · S2 Front | `src/utils/*.test.ts`, `client.test.ts`, hooks y componentes |
| @Sebas-p-s | S1 E2E · S2 BD | `test_validaciones.py` |
| @Lincoln1986 | S1 E2E · S2 E2E (CI) | `tests.yml`, `test_security.py` |

> En este repo de práctica los commits son todos de @javierperez14. En el repo real cada integrante hace commit de **sus** tests con **su** usuario (`git shortlog -sn -- '*test*'`).
