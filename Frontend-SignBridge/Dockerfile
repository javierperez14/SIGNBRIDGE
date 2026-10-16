# ── Etapa 1: compilar la SPA ─────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# corepack trae pnpm en la versión exacta del campo "packageManager"
RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# El navegador llama a la API en el MISMO dominio, bajo /api: Nginx la
# reenvía al backend. Vite inyecta este valor en el build.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ── Etapa 2: servir los archivos con Nginx ───────────────────────────────
# La imagen final no tiene Node ni el código fuente: solo dist/ y Nginx.
FROM nginx:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
