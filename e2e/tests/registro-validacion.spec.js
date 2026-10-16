// Flujo crítico: el formulario de registro avisa cuando las contraseñas no coinciden.
// Autor: @Sebas-p-s · Capa S1: E2E
import { expect, test } from '@playwright/test';

test('should warn that passwords do not match before creating the account', async ({ page }) => {
  // Arrange
  await page.goto('/register');

  // Act: la confirmación es distinta a la contraseña
  await page.getByLabel('Contraseña *', { exact: true }).fill('SignBridge2026*');
  await page.getByLabel('Confirmar contraseña *').fill('OtraClave2026*');

  // Assert: aviso visible y el botón de crear cuenta no deja continuar
  await expect(page.getByText('No coinciden', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
});
