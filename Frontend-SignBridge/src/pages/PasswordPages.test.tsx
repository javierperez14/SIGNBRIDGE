// /forgot-password y /reset-password
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/client';
import { renderEnRuta } from '../test/render';
import { ForgotPassword, ResetPassword } from './PasswordPages';

const errorApi = (detail: unknown) => Object.assign(new Error('api'), { isAxiosError: true, response: { status: 400, data: { detail } } });

describe('ForgotPassword', () => {
  it('should send the recovery link and hide the form', async () => {
    const forgot = vi.spyOn(authApi, 'forgotPassword').mockResolvedValue({ data: {} } as never);
    renderEnRuta(<ForgotPassword />, '/forgot-password');

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(forgot).toHaveBeenCalledWith('ana@example.com');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Enviar enlace' })).not.toBeInTheDocument());
  });
});

describe('ResetPassword', () => {
  async function escribir(password: string, confirmacion: string) {
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), password);
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), confirmacion);
  }

  it.each([
    ['débil', 'abc', 'abc'],
    ['distinta en la confirmación', 'Clave123*', 'Clave123#'],
  ])('should not allow a %s password', async (_caso, password, confirmacion) => {
    renderEnRuta(<ResetPassword />, '/reset-password?token=tok');

    await escribir(password, confirmacion);

    expect(screen.getByRole('button', { name: 'Restablecer contraseña' })).toBeDisabled();
  });

  it('should send the token from the URL with the new password', async () => {
    const reset = vi.spyOn(authApi, 'resetPassword').mockResolvedValue({ data: {} } as never);
    renderEnRuta(<ResetPassword />, '/reset-password?token=tok-123');

    await escribir('Clave123*', 'Clave123*');
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

    expect(reset).toHaveBeenCalledWith('tok-123', 'Clave123*');
    expect(await screen.findByText('¡Contraseña actualizada!')).toBeInTheDocument();
  });

  it('should show the reason when the link expired', async () => {
    vi.spyOn(authApi, 'resetPassword').mockRejectedValue(errorApi('Token inválido'));
    renderEnRuta(<ResetPassword />, '/reset-password?token=viejo');

    await escribir('Clave123*', 'Clave123*');
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido');
  });
});
