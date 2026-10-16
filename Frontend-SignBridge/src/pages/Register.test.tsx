// Página /register: lo que ve la persona según lo que responda la API.
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/client';
import { renderEnRuta } from '../test/render';
import Register from './Register';

beforeEach(() => {
  vi.spyOn(authApi, 'getCities').mockResolvedValue({ data: [{ region_name: 'Cali' }, { region_name: 'Bogotá' }] } as never);
});

async function llenarFormulario() {
  await userEvent.type(screen.getByLabelText('Nombres *'), 'ana');
  await userEvent.type(screen.getByLabelText('Apellidos *'), 'paz');
  await userEvent.type(screen.getByLabelText('Teléfono *'), '001234567');
  await userEvent.selectOptions(screen.getByLabelText('Ciudad *'), await screen.findByRole('option', { name: 'Cali' }));
  await userEvent.type(screen.getByLabelText('Dirección *'), 'Cra 1');
  await userEvent.type(screen.getByLabelText('Correo electrónico *'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Contraseña *'), 'Clave123*');
  await userEvent.type(screen.getByLabelText('Confirmar contraseña *'), 'Clave123*');
}

const errorApi = (detail: unknown) => Object.assign(new Error('api'), { response: { status: 422, data: { detail } } });

describe('Register', () => {
  it('should load the cities from the API (objects with region_name)', async () => {
    renderEnRuta(<Register />, '/register');
    expect(await screen.findByRole('option', { name: 'Cali' })).toBeInTheDocument();
  });

  it('should keep "Crear cuenta" disabled until the form is complete', async () => {
    renderEnRuta(<Register />, '/register');
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();

    await llenarFormulario();

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('should create the account and confirm it', async () => {
    const register = vi.spyOn(authApi, 'register').mockResolvedValue({ data: {} } as never);
    renderEnRuta(<Register />, '/register');

    await llenarFormulario();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(register).toHaveBeenCalled());
    expect(register.mock.calls[0][0]).toMatchObject({ first_name: 'Ana', phone: '3001234567', city: 'Cali' });
    expect(await screen.findByRole('status')).toHaveTextContent('¡Cuenta creada exitosamente!');
  });

  it.each([
    ['un mensaje de texto', 'El correo ya está registrado', 'El correo ya está registrado'],
    ['una lista de errores 422', [{ loc: ['body', 'phone'], msg: 'Value error' }], 'phone: Value error'],
    ['un error sin detalle', undefined, 'Error al registrar usuario. Intenta de nuevo.'],
  ])('should show the error when the API answers with %s', async (_caso, detail, mensaje) => {
    vi.spyOn(authApi, 'register').mockRejectedValue(errorApi(detail));
    renderEnRuta(<Register />, '/register');

    await llenarFormulario();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje);
  });
});
