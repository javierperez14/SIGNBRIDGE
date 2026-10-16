// Quién puede entrar a cada pantalla según su sesión y su rol.
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from '../../api/client';
import { renderEnRuta } from '../../test/render';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';

function sesion(rol?: string) {
  if (rol) {
    // AuthProvider pide el perfil al arrancar: se responde sin ir a la red
    vi.spyOn(authApi, 'me').mockResolvedValue({ data: { full_name: 'Ana' } } as never);
    localStorage.setItem('token', 'tok');
    localStorage.setItem('role', rol);
  }
}

describe('ProtectedRoute', () => {
  it.each([
    // [rol, adminOnly, supportOnly, ¿ve la pantalla?, redirige a]
    [undefined, false, false, false, '/login'],
    ['Cliente', false, false, true, null],
    ['Cliente', true, false, false, '/dashboard'],
    ['Administrador', true, false, true, null],
    ['Cliente', false, true, false, '/dashboard'],
    ['Soporte', false, true, true, null],
    ['Administrador', false, true, true, null],   // Admin puede ver lo de Soporte
  ])('rol %s, adminOnly=%s, supportOnly=%s → ve=%s', async (rol, adminOnly, supportOnly, ve, destino) => {
    sesion(rol);

    renderEnRuta(
      <ProtectedRoute adminOnly={adminOnly} supportOnly={supportOnly}><h1>Pantalla privada</h1></ProtectedRoute>,
      '/privada',
    );

    if (ve) {
      expect(await screen.findByRole('heading', { name: 'Pantalla privada' })).toBeInTheDocument();
    } else {
      await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent(destino!));
    }
  });
});

describe('PublicRoute', () => {
  it.each([
    ['Administrador', '/admin'],
    ['Soporte', '/support'],
    ['Cliente', '/dashboard'],
  ])('should send a logged in %s to %s', async (rol, destino) => {
    sesion(rol);
    renderEnRuta(<PublicRoute><h1>Login</h1></PublicRoute>, '/login');
    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent(destino));
  });

  it('should show the public page when there is no session', async () => {
    renderEnRuta(<PublicRoute><h1>Login</h1></PublicRoute>, '/login');
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
