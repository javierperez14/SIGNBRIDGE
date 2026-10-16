// Datos y pasos compartidos por los tests E2E.
//
// Los usuarios demo los crea Base-de-datos/04-scripts-dml.sql (o el CI).
// La contraseña es pública a propósito: solo existe en bases de desarrollo.
export const CLIENTE = {
  email: 'cliente.demo@example.com',
  password: 'SignBridge2026*',
};

/** Abre /login y envía el formulario con las credenciales dadas. */
export async function iniciarSesion(page, { email, password }) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  // Hay dos botones "Iniciar sesión" (la pestaña y el envío): se usa el del formulario
  await page.locator('form').getByRole('button', { name: 'Iniciar sesión' }).click();
}
