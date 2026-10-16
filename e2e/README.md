# Pruebas E2E (Playwright)

Prueban los **flujos críticos** como los vive la persona usuaria: abren el navegador, escriben, hacen clic y verifican lo que ve.

| Test | Flujo | Autor (S1) |
|---|---|---|
| `login-valido.spec.js` | Entrar con credenciales válidas | @javierperez14 |
| `login-incorrecto.spec.js` | Ver el error con contraseña equivocada | @juan-soto350 |
| `registro-validacion.spec.js` | Aviso de contraseñas que no coinciden | @Sebas-p-s |
| `traducir-texto.spec.js` | Traducir "hola amigo" a señas | @Lincoln1986 |

## Cómo correrlos

```bash
# 1. Backend y base de datos (con los usuarios demo de Base-de-datos/04-scripts-dml.sql)
docker compose up -d postgres backend

# 2. Dependencias del frontend (Playwright levanta Vite solo)
cd Frontend-SignBridge && pnpm install && cd ..

# 3. Tests
cd e2e
pnpm install
pnpm exec playwright install chromium   # solo la primera vez
pnpm test                               # pnpm report → reporte HTML
```

## Escribir uno nuevo

1. `pnpm codegen` y graba el flujo.
2. Limpia el borrador: locators por **rol o etiqueta** (`getByRole`, `getByLabel`), rutas relativas y estructura **AAA**.
3. Al menos una aserción sobre lo que **ve** la persona.
4. Si crea registros, usa datos únicos (`Date.now()`).
5. Hazlo fallar a propósito una vez.

> Si `getByLabel` no encuentra un campo, al `<input>` le falta su `<label>`: arréglalo en el componente (ver PR #7).
