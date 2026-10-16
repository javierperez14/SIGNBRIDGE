// Reglas de los formularios de registro. Antes vivían copiadas dentro de
// Register.tsx y AuthModal.tsx; ahora hay una sola versión, con tests.

/** Pone en mayúscula la primera letra de cada palabra: "juan  pérez" → "Juan  Pérez". */
export function capitalizar(valor: string): string {
  return valor.replace(/(^|\s)\S/g, c => c.toUpperCase());
}

/**
 * Deja solo dígitos, máximo 10, y fuerza que el primero sea 3
 * (los celulares en Colombia empiezan por 3).
 */
export function formatearTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 10);
  if (digitos.length > 0 && digitos[0] !== '3') return '3' + digitos.slice(1, 10);
  return digitos;
}

/** Celular colombiano: exactamente 10 dígitos y empieza por 3. */
export function telefonoValido(telefono: string): boolean {
  return /^3\d{9}$/.test(telefono);
}
