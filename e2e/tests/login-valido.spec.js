// Flujo crítico: una persona registrada entra a la app.
// Autor: @javierperez14 · Capa S1: E2E
import { expect, test } from '@playwright/test';
import { CLIENTE, iniciarSesion } from './helpers.js';

test('should open the home page with a welcome message after a valid login', async ({ page }) => {
  // Arrange: usuario demo con rol Cliente (ver helpers.js)

  // Act
  await iniciarSesion(page, CLIENTE);

  // Assert: llega a /home y ve su saludo
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cliente, bienvenido a SignBridge');
});
