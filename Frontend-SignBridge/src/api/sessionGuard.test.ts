// Autor: @juan-soto350 · Capa S2: Front
// Regla del PR #8: no todo 401 significa "sesión vencida".
import { describe, expect, it } from 'vitest';
import { debeCerrarSesion } from './sessionGuard';

describe('debeCerrarSesion', () => {
  it.each([
    [401, '/dashboard/user', 'get', true],    // token vencido en cualquier pantalla
    [401, '/auth/me', 'get', true],           // GET /auth/me con token vencido SÍ cierra
    [401, '/auth/login', 'post', false],      // contraseña equivocada en el login
    [401, '/auth/login', 'POST', false],      // el método llega en mayúsculas a veces
    [401, '/auth/me', 'delete', false],       // contraseña equivocada al borrar la cuenta
    [403, '/admin/users', 'get', false],      // sin permiso no es lo mismo que sin sesión
    [500, '/dashboard/user', 'get', false],
    [undefined, '/dashboard/user', 'get', false], // sin respuesta (red caída)
  ])('status %s en %s %s → %s', (status, url, method, esperado) => {
    expect(debeCerrarSesion(status, url, method)).toBe(esperado);
  });
});
