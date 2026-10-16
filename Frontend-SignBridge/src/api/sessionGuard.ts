/**
 * ¿Un 401 de la API significa que la sesión expiró?
 *
 * Casi siempre sí: el token venció o es inválido, y hay que cerrar sesión.
 * Pero algunos endpoints responden 401 cuando la CONTRASEÑA que escribió la
 * persona es incorrecta. En esos casos la pantalla debe mostrar el error, no
 * recargar la página.
 */
const CREDENCIAL_INCORRECTA: ReadonlyArray<{ method: string; url: string }> = [
  { method: 'post', url: '/auth/login' },  // login con contraseña equivocada
  { method: 'delete', url: '/auth/me' },   // eliminar cuenta con contraseña equivocada
];

export function debeCerrarSesion(status: number | undefined, url = '', method = 'get'): boolean {
  if (status !== 401) return false;
  const m = method.toLowerCase();
  return !CREDENCIAL_INCORRECTA.some(e => e.method === m && e.url === url);
}
