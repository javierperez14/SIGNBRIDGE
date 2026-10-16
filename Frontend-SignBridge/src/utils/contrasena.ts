// Regla de contraseña segura. Antes estaba copiada en 5 sitios (Register,
// AuthModal, PasswordPages x2 y UI); si cambiaba en uno, los otros quedaban
// desactualizados. Debe coincidir con _validate_strong_password del backend.

export const LONGITUD_MINIMA = 8;

// Los mismos conjuntos de caracteres que usa el backend. Antes el frontend
// tomaba como "especial" cualquier cosa fuera de A-Za-z0-9 (incluida la ñ):
// "Contraseña1" se veía válida en el formulario y la API la rechazaba.
const MAYUSCULA = /[A-ZÁÉÍÓÚÜÑ]/;
const MINUSCULA = /[a-záéíóúüñ]/;
const NUMERO = /\d/;
const ESPECIAL = /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/;

export interface Requisito {
  label: string;
  met: boolean;
}

export function requisitosContrasena(password: string): Requisito[] {
  return [
    { label: `Mínimo ${LONGITUD_MINIMA} caracteres`, met: password.length >= LONGITUD_MINIMA },
    { label: 'Al menos una mayúscula', met: MAYUSCULA.test(password) },
    { label: 'Al menos una minúscula', met: MINUSCULA.test(password) },
    { label: 'Al menos un número', met: NUMERO.test(password) },
    { label: 'Al menos un carácter especial', met: ESPECIAL.test(password) },
  ];
}

export function contrasenaValida(password: string): boolean {
  return requisitosContrasena(password).every(r => r.met);
}

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

/** Barra de fortaleza: 1 punto por cada criterio cumplido (máx. 6). */
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (MAYUSCULA.test(password)) score++;
  if (MINUSCULA.test(password)) score++;
  if (NUMERO.test(password)) score++;
  if (ESPECIAL.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score === 3) return 'fair';
  if (score === 4 || score === 5) return 'strong';
  return 'very-strong';
}
