// Autor: @juan-soto350 · Capa S2: Front
import { describe, expect, it } from 'vitest';
import {
  COLOR_CONFIABLE,
  COLOR_REVISAR,
  COLOR_SIN_CALIFICAR,
  COLOR_URGENTE,
  colorPorRating,
} from './calificacion';

describe('colorPorRating', () => {
  // Particiones: sin calificar | [1, 3) | [3, 4) | [4, 5]. Se prueban los bordes.
  it.each([
    [null, COLOR_SIN_CALIFICAR],
    [undefined, COLOR_SIN_CALIFICAR],
    [1, COLOR_URGENTE],
    [2.99, COLOR_URGENTE],   // justo antes del borde de 3
    [3, COLOR_REVISAR],      // borde
    [3.99, COLOR_REVISAR],   // justo antes del borde de 4
    [4, COLOR_CONFIABLE],    // borde
    [5, COLOR_CONFIABLE],
  ])('rating %s → %s', (rating, color) => {
    expect(colorPorRating(rating)).toBe(color);
  });

  it('should treat 0 as a real (very low) rating, not as "no rating"', () => {
    // 0 es falsy en JS: un `if (!rating)` lo confundiría con "sin calificar"
    expect(colorPorRating(0)).toBe(COLOR_URGENTE);
  });
});
