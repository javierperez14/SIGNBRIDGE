// Flujo crítico (el corazón de la app): escribir una frase y ver sus señas LSC.
// Autor: @Lincoln1986 · Capa S1: E2E
import { expect, test } from '@playwright/test';
import { CLIENTE, iniciarSesion } from './helpers.js';

test('should show one sign per word when translating "hola amigo"', async ({ page }) => {
  // Arrange: sesión iniciada y pantalla de Voz a Señas
  await iniciarSesion(page, CLIENTE);
  await expect(page).toHaveURL(/\/home$/);
  await page.goto('/voice-to-sign');

  // Act
  await page.getByPlaceholder('Escribe una palabra, frase o expresión en español…').fill('hola amigo');
  await page.getByRole('button', { name: 'Traducir a señas' }).click();

  // Assert: una seña por palabra, en orden, y el resumen de la traducción
  await expect(page.getByRole('button', { name: '1. hola' })).toBeVisible();
  await expect(page.getByRole('button', { name: '2. amigo' })).toBeVisible();
  await expect(page.getByText('Traducción completa: 2 seña(s) encontrada(s).')).toBeVisible();
});
