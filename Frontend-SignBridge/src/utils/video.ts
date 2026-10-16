// Utilidades de URL de video. Antes estaban duplicadas en
// SignSequencePlayer.tsx y Vocabulary.tsx.
import { API_URL } from '../api/client';

/**
 * Los videos locales llegan como ruta relativa ("/media/videos/x.mp4"):
 * se les antepone la URL del backend. Las URL absolutas quedan igual.
 */
export function urlCompleta(url: string, base: string = API_URL): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${base}${url}`;
}

export function esYouTube(url: string): boolean {
  return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

/** Saca el id del video de cualquier formato de URL de YouTube. */
export function idDeYouTube(url: string): string | null {
  if (!url) return null;
  const embed = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embed) return embed[1];
  const corto = url.match(/youtu\.be\/([^?&/]+)/);
  if (corto) return corto[1];
  const largo = url.match(/[?&]v=([^?&]+)/);
  if (largo) return largo[1];
  return null;
}

/** URL para incrustar en un <iframe>; si no es YouTube la devuelve igual. */
export function urlEmbedYouTube(url: string): string {
  if (url.includes('youtube.com/embed/')) return url; // ya es embebible (conserva sus parámetros)
  const id = idDeYouTube(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}
