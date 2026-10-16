// Autor: @juan-soto350 · Capa S2: Front
import { describe, expect, it } from 'vitest';
import { capitalizar, formatearTelefono, telefonoValido } from './formularios';

describe('formatearTelefono', () => {
  it.each([
    ['', ''],
    ['3001234567', '3001234567'],      // ya es válido: no se toca
    ['300 123-4567', '3001234567'],    // quita espacios y guiones
    ['30012345678', '3001234567'],     // valor límite: el dígito 11 se descarta
    ['5001234567', '3001234567'],      // no empieza por 3: se fuerza el 3
    ['abc', ''],                       // sin dígitos
  ])('should turn "%s" into "%s"', (entrada, esperado) => {
    expect(formatearTelefono(entrada)).toBe(esperado);
  });
});

describe('telefonoValido', () => {
  // Valores límite alrededor de 10 dígitos
  it.each([
    ['300123456', false],    // 9 dígitos
    ['3001234567', true],    // 10 dígitos: el borde válido
    ['30012345678', false],  // 11 dígitos
    ['2001234567', false],   // 10 dígitos pero no empieza por 3
    ['300123456a', false],   // con una letra
  ])('should return %s → %s', (telefono, esperado) => {
    expect(telefonoValido(telefono)).toBe(esperado);
  });
});

describe('capitalizar', () => {
  it('should uppercase the first letter of every word and keep the rest', () => {
    expect(capitalizar('maría josé  de la peña')).toBe('María José  De La Peña');
  });
});
