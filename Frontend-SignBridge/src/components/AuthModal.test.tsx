// El modal de acceso de la landing: login, registro y recuperar contraseña.
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/client';
import { renderEnRuta } from '../test/render';
import { AuthModal } from './AuthModal';

const onClose = vi.fn();

function errorApi(detail: unknown) {
  return Object.assign(new Error('api'), { response: { status: 401, data: { detail } } });
}

beforeEach(() => {
  onClose.mockReset();
  vi.spyOn(authApi, 'getCities').mockResolvedValue({ data: ['Bogotá', 'Cali'] } as never);
});

describe('AuthModal · login', () => {
  it('should log in, close the modal and go to /home', async () => {
    const login = vi.spyOn(authApi, 'login').mockResolvedValue({ data: { access_token: 'tok', role: 'Cliente' } } as never);
    vi.spyOn(authApi, 'me').mockResolvedValue({ data: { full_name: 'Ana' } } as never);
    renderEnRuta(<AuthModal onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Clave123*');
    // Hay dos botones "Iniciar sesión": la pestaña y el envío (el último)
    await userEvent.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).at(-1)!);

    expect(login).toHaveBeenCalledWith('ana@example.com', 'Clave123*');
    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/home'));
    expect(onClose).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('tok');
  });

  it('should show the error message the API returns', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(errorApi('Credenciales incorrectas'));
    renderEnRuta(<AuthModal onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala');
    await userEvent.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).at(-1)!);

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas');
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([
    ['la tecla Escape', () => userEvent.keyboard('{Escape}')],
    ['el botón Cerrar', () => userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))],
  ])('should close with %s', async (_como, cerrar) => {
    renderEnRuta(<AuthModal onClose={onClose} />);
    await cerrar();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('AuthModal · registro', () => {
  it('should create the account with the names capitalized and the phone cleaned up', async () => {
    const register = vi.spyOn(authApi, 'register').mockResolvedValue({ data: {} } as never);
    renderEnRuta(<AuthModal initialTab="register" onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Nombres *'), 'ana maría');
    await userEvent.type(screen.getByLabelText('Apellidos *'), 'paz');
    await userEvent.type(screen.getByLabelText('Teléfono *'), '00 123 4567');
    await userEvent.selectOptions(screen.getByLabelText('Ciudad *'), await screen.findByRole('option', { name: 'Cali' }));
    await userEvent.type(screen.getByLabelText('Dirección *'), 'Cra 1 # 2-3');
    await userEvent.type(screen.getByLabelText('Correo electrónico *'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña *'), 'Clave123*');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña *'), 'Clave123*');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => expect(register).toHaveBeenCalled());
    expect(register.mock.calls[0][0]).toMatchObject({
      first_name: 'Ana María', last_name: 'Paz', phone: '3001234567', city: 'Cali', email: 'ana@example.com',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('¡Cuenta creada!');
  });
});

describe('AuthModal · recuperar contraseña', () => {
  it('should send the recovery link to the email', async () => {
    const forgot = vi.spyOn(authApi, 'forgotPassword').mockResolvedValue({ data: {} } as never);
    renderEnRuta(<AuthModal initialTab="forgot" onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(forgot).toHaveBeenCalledWith('ana@example.com');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Enviar enlace' })).not.toBeInTheDocument());
  });

  it('should say when the request could not be processed', async () => {
    vi.spyOn(authApi, 'forgotPassword').mockRejectedValue(new Error('red'));
    renderEnRuta(<AuthModal initialTab="forgot" onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo procesar la solicitud');
  });
});
