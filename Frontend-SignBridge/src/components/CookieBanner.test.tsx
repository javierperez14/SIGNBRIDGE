// Autor: @juan-soto350 · Capa S2: Front
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CookieBanner } from './CookieBanner';

describe('CookieBanner', () => {
  it.each([
    ['Aceptar todas', 'accepted'],
    ['Solo esenciales', 'rejected'],
  ])('clicking "%s" saves "%s" and hides the banner', async (boton, guardado) => {
    render(<MemoryRouter><CookieBanner /></MemoryRouter>);

    // El banner aparece 600 ms después de cargar la página (para no tapar el contenido)
    await userEvent.click(await screen.findByRole('button', { name: boton }, { timeout: 2000 }));

    expect(localStorage.getItem('sb_cookie_consent')).toBe(guardado);
    expect(screen.queryByRole('dialog', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
  });

  it('should not ask again when the person already answered', () => {
    localStorage.setItem('sb_cookie_consent', 'accepted');
    render(<MemoryRouter><CookieBanner /></MemoryRouter>);
    expect(screen.queryByRole('dialog', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
  });
});
