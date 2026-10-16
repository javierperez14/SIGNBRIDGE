FROM node:22-alpine

WORKDIR /app

# corepack trae pnpm en la versión exacta del campo "packageManager"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
