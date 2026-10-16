// Autor: @juan-soto350 · Capa S2: Front
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../utils/accesibilidad';
import AccessibilityWidget from './AccessibilityWidget';

const estilos = () => document.getElementById('a11y-widget-styles')?.textContent ?? '';

async function abrir() {
  render(<AccessibilityWidget />);
  await userEvent.click(screen.getByRole('button', { name: 'Abrir menú de accesibilidad' }));
  return screen.getByRole('dialog', { name: 'Menú de accesibilidad' });
}

describe('AccessibilityWidget', () => {
  it('should apply an option, mark it as pressed and remember it', async () => {
    await abrir();

    const boton = screen.getByRole('button', { name: /Escala de grises/ });
    await userEvent.click(boton);

    expect(boton).toHaveAttribute('aria-pressed', 'true');
    expect(estilos()).toContain('grayscale(1)');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).grayscale).toBe(true);
  });

  it('should switch the whole palette with "Modo claro"', async () => {
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: /Modo claro/ }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('should close with Escape', async () => {
    await abrir();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Menú de accesibilidad' })).not.toBeInTheDocument();
  });
});
