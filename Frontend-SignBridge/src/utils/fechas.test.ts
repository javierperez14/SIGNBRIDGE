// Autor: @juan-soto350 · Capa S2: Front
//
// FIRST / Repeatable: "ahora" es una fecha fija que se pasa por parámetro.
// Con Date.now() real, el test cambiaría de resultado según el día.
import { describe, expect, it } from 'vitest';
import { tiempoRelativo } from './fechas';

const AHORA = new Date('2026-10-15T12:00:00Z');
const haceSegundos = (s: number) => new Date(AHORA.getTime() - s * 1000).toISOString();

describe('tiempoRelativo', () => {
  it.each([
    [0, 'recién'],
    [59, 'recién'],           // borde: 1 segundo antes del minuto
    [60, 'hace 1 min'],       // borde: justo 1 minuto
    [3599, 'hace 59 min'],
    [3600, 'hace 1 h'],       // borde: justo 1 hora
    [86399, 'hace 23 h'],
    [86400, 'ayer'],          // borde: justo 24 horas
    [172799, 'ayer'],
  ])('%i segundos atrás → "%s"', (segundos, esperado) => {
    expect(tiempoRelativo(haceSegundos(segundos), AHORA)).toBe(esperado);
  });

  it('should show the short date after two days', () => {
    expect(tiempoRelativo('2026-08-12T15:00:00Z', AHORA)).toMatch(/12.*ago/);
  });

  it.each([null, undefined, ''])('should return an empty string for %s', valor => {
    expect(tiempoRelativo(valor, AHORA)).toBe('');
  });
});
