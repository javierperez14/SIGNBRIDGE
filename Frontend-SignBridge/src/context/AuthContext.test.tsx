// Autor: @juan-soto350 · Capa S2: Front
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/client';
import { AuthProvider, useAuth } from './AuthContext';

const PERFIL = { id_user: 'u1', full_name: 'Ana Paz', email: 'ana@example.com', role: 'Cliente' };

function Sonda() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="estado">{auth.loading ? 'cargando' : auth.user ? auth.user.full_name : 'sin sesión'}</span>
      <span data-testid="roles">{`${auth.isAdmin}-${auth.isSupport}`}</span>
      <button onClick={() => auth.login({ access_token: 'tok', role: 'Soporte' } as never)}>entrar</button>
      <button onClick={auth.logout}>salir</button>
    </div>
  );
}

const montar = () => render(<AuthProvider><Sonda /></AuthProvider>);

describe('AuthProvider', () => {
  it('should finish loading without user when there is no saved token', async () => {
    montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('sin sesión'));
  });

  it('should restore the user from a saved token', async () => {
    localStorage.setItem('token', 'tok');
    vi.spyOn(authApi, 'me').mockResolvedValue({ data: PERFIL } as never);

    montar();

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('Ana Paz'));
  });

  it('should forget an expired token instead of keeping a broken session', async () => {
    localStorage.setItem('token', 'vencido');
    vi.spyOn(authApi, 'me').mockRejectedValue(new Error('401'));

    montar();

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('sin sesión'));
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should save the session on login and remove it on logout', async () => {
    vi.spyOn(authApi, 'me').mockResolvedValue({ data: PERFIL } as never);
    montar();

    await act(() => screen.getByText('entrar').click());
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('Ana Paz'));
    expect([localStorage.getItem('token'), localStorage.getItem('role')]).toEqual(['tok', 'Soporte']);
    expect(screen.getByTestId('roles')).toHaveTextContent('false-true');

    act(() => screen.getByText('salir').click());
    expect(screen.getByTestId('estado')).toHaveTextContent('sin sesión');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it.each([
    ['Administrador', 'true-false'],
    ['admin', 'true-false'],
    ['Soporte', 'false-true'],
    ['soporte', 'false-true'],
    ['Cliente', 'false-false'],
  ])('role %s → isAdmin-isSupport = %s', async (rol, esperado) => {
    localStorage.setItem('role', rol);
    montar();
    await waitFor(() => expect(screen.getByTestId('roles')).toHaveTextContent(esperado));
  });
});

describe('useAuth', () => {
  it('should fail loudly when used outside AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Sonda />)).toThrow();
  });
});
