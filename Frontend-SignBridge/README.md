# SignBridge — Frontend

SPA con **React 19 + Vite + TypeScript**.

## Requisitos

- Node.js 22 LTS
- pnpm (se activa con `corepack enable`; la versión exacta sale de `packageManager` en `package.json`)

## Comandos

```bash
corepack enable
pnpm install --frozen-lockfile   # instala exactamente lo de pnpm-lock.yaml
pnpm dev                         # http://localhost:5173
pnpm build                       # verifica tipos y genera dist/
pnpm lint
```

## Dependencias

- Versiones **exactas** en `package.json` (sin `^` ni `~`). El archivo `.npmrc` hace que `pnpm add` también las guarde así.
- `package-lock.json` ya no existe: el lockfile es `pnpm-lock.yaml` y se sube al repo.
- No mezcles `npm install` con pnpm: generaría otro lockfile.
