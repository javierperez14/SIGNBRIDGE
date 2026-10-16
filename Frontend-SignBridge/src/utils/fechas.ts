// FIRST / Repeatable: la hora actual entra por parámetro (`ahora`).
// En la app se usa el valor por defecto; en los tests se pasa una fecha fija,
// así el resultado no cambia según el día en que se corran.

/** "recién", "hace 5 min", "hace 3 h", "ayer" o la fecha corta ("12 ago"). */
export function tiempoRelativo(iso?: string | null, ahora: Date = new Date()): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);
  if (segundos < 60) return 'recién';
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)} h`;
  if (segundos < 172800) return 'ayer';
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}
