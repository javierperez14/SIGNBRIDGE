// Flujo crítico: con una contraseña equivocada la persona debe ver por qué no entra.
// Autor: @juan-soto350 · Capa S1: E2E
//
// Este test encontró un defecto real (PR #8): el interceptor de axios
// recargaba la página ante cualquier 401 y el mensaje nunca se veía.
import { expect, test } from '@playwright/test';
import { CLIENTE, iniciarSesion } from './helpers.js';

test('should show an error and stay on the form when the password is wrong', async ({ page }) => {
  // Arrange: correo real con una contraseña que no es la suya
  const credenciales = { email: CLIENTE.email, password: 'NoEsLaClave123*' };

  // Act
  await iniciarSesion(page, credenciales);

  // Assert: el error se anuncia (role=alert) y el correo sigue escrito
  await expect(page.getByRole('alert')).toHaveText('Credenciales incorrectas');
  await expect(page.getByLabel('Correo electrónico')).toHaveValue(CLIENTE.email);
});
