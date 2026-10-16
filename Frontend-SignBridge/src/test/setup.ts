// Se carga antes de cada archivo de test (vite.config.ts → test.setupFiles).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom no implementa scrollIntoView (no dibuja la página): se reemplaza por
// una función vacía para que los componentes que hacen scroll no fallen.
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();               // desmonta lo que renderizó el test
  localStorage.clear();    // cada test arranca sin sesión
  vi.restoreAllMocks();
});
