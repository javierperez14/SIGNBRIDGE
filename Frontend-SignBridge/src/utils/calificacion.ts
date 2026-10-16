// Color de cada seña en el ranking de estadísticas según su calificación
// promedio (1 a 5). Así se ve de un vistazo qué traducciones hay que revisar.

export const COLOR_SIN_CALIFICAR = '#8B5CF6'; // violeta: usada pero sin calificar
export const COLOR_CONFIABLE = '#27A85F';     // verde: promedio >= 4
export const COLOR_REVISAR = '#D66A35';       // ámbar: promedio >= 3
export const COLOR_URGENTE = '#E5534B';       // rojo: promedio < 3

export function colorPorRating(rating?: number | null): string {
  if (rating == null) return COLOR_SIN_CALIFICAR;
  if (rating >= 4) return COLOR_CONFIABLE;
  if (rating >= 3) return COLOR_REVISAR;
  return COLOR_URGENTE;
}
