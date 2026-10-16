// Autor: @juan-soto350 · Capa S2: Front
import { describe, expect, it } from 'vitest';
import { contrasenaValida, getPasswordStrength, requisitosContrasena } from './contrasena';

describe('contrasenaValida', () => {
  // Partición válida + una inválida por cada requisito que falta.
  it.each([
    ['Abcdef1*', true,  'cumple todo con 8 caracteres (borde)'],
    ['Abcde1*',  false, '7 caracteres (justo debajo del borde)'],
    ['abcdef1*', false, 'sin mayúscula'],
    ['ABCDEF1*', false, 'sin minúscula'],
    ['Abcdefg*', false, 'sin número'],
    ['Abcdefg1', false, 'sin carácter especial'],
    ['',         false, 'vacía'],
    // Mismas reglas que el backend (_validate_strong_password):
    ['Contraseña1',  false, 'la ñ es letra, no carácter especial'],
    ['Contraseña1*', true,  'con ñ y un especial de la lista'],
    ['ÁRBOLES1*',    false, 'tildes en mayúscula no cuentan como minúscula'],
    ['Abcdef1 ',     false, 'el espacio no es carácter especial'],
  ])('"%s" → %s (%s)', (password, esperado) => {
    expect(contrasenaValida(password)).toBe(esperado);
  });
});

describe('requisitosContrasena', () => {
  it('should report exactly which requirements are missing', () => {
    const faltan = requisitosContrasena('abc').filter(r => !r.met).map(r => r.label);

    expect(faltan).toEqual([
      'Mínimo 8 caracteres',
      'Al menos una mayúscula',
      'Al menos un número',
      'Al menos un carácter especial',
    ]);
  });
});

describe('getPasswordStrength', () => {
  // El puntaje sube 1 por criterio; los bordes están en 2/3, 3/4 y 5/6 puntos.
  it.each([
    ['', null],
    ['abc', 'weak'],              // 1 punto (minúscula)
    ['abcdefgh', 'weak'],         // 2 puntos: borde superior de "weak"
    ['abcdefgH', 'fair'],         // 3 puntos
    ['abcdefgH1', 'strong'],      // 4 puntos
    ['abcdefgH1*', 'strong'],     // 5 puntos
    ['abcdefghH1*x', 'very-strong'], // 6 puntos: 12 caracteres (borde de longitud)
    ['abcdefgH1*x', 'strong'],    // 11 caracteres: justo antes del borde
  ])('"%s" → %s', (password, esperado) => {
    expect(getPasswordStrength(password)).toBe(esperado);
  });
});
