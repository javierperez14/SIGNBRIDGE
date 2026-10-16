import { defineConfig, devices } from '@playwright/test';

// Puerto del frontend. Cámbialo con FRONT_PORT si el 5173 ya está ocupado.
const port = Number(process.env.FRONT_PORT ?? 5173);

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://localhost:${port}`,
    // Guarda la traza solo cuando un test falla y se reintenta: se abre con "pnpm report"
    trace: 'on-first-retry',
    // Opcional: usar un Chromium ya instalado en vez del que descarga Playwright
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright levanta el frontend (Vite). El backend y la BD los levantas tú
  // antes: docker compose up -d postgres backend  (ver e2e/README.md).
  // Se lanza vite con node, sin pnpm de por medio, para que Playwright pueda
  // detenerlo al terminar.
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort`,
    cwd: '../Frontend-SignBridge',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
