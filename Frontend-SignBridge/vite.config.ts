/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Semana 1: todavía no hay tests unitarios; la línea base es 0%.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      // Se mide toda la lógica de la interfaz.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',        // arranque: solo monta <App />, no tiene lógica de negocio
        'src/**/*.test.{ts,tsx}',
        'src/test/**',         // configuración de los tests
        'src/**/*.d.ts',       // solo tipos, no se ejecutan
      ],
      reporter: ['text', 'html'],
      // Umbral = línea base. Si la cobertura baja de aquí, "pnpm test" falla.
      // Solo puede subir: ver docs/matriz-rotacion.md
      thresholds: { lines: 0, branches: 0, functions: 0, statements: 0 },
    },
  },
})
