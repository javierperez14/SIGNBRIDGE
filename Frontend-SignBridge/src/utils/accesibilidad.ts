// Ajustes del widget de accesibilidad: qué opciones hay, cómo se guardan y
// qué CSS genera cada una. Antes vivía dentro de AccessibilityWidget.tsx.

export interface A11ySettings {
  bigText: boolean;
  hugeText: boolean;
  highContrast: boolean;
  lightMode: boolean;
  highlightLinks: boolean;
  textSpacing: boolean;
  lineHeight: boolean;
  stopAnimations: boolean;
  hideImages: boolean;
  dyslexiaFont: boolean;
  bigCursor: boolean;
  alignLeft: boolean;
  grayscale: boolean;
}

export const DEFAULT_SETTINGS: A11ySettings = {
  bigText: false,
  hugeText: false,
  highContrast: false,
  lightMode: false,
  highlightLinks: false,
  textSpacing: false,
  lineHeight: false,
  stopAnimations: false,
  hideImages: false,
  dyslexiaFont: false,
  bigCursor: false,
  alignLeft: false,
  grayscale: false,
};

export const STORAGE_KEY = 'signbridge-a11y-settings';

export function loadSettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Construye el <style> global según los ajustes activos
// ─────────────────────────────────────────────────────────────────────────────

export function buildCss(s: A11ySettings): string {
  const rules: string[] = [];

  if (s.bigText) {
    rules.push(`html { font-size: 112% !important; }`);
  }
  if (s.hugeText) {
    rules.push(`html { font-size: 128% !important; }`);
  }
  if (s.highContrast) {
    rules.push(`
      html { filter: contrast(1.35) !important; }
    `);
  }
  if (s.highlightLinks) {
    rules.push(`
      a, button { outline: 2px solid #D66A35 !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
    `);
  }
  if (s.textSpacing) {
    rules.push(`
      body, p, span, li, td, th, label, h1, h2, h3, h4, h5, h6 {
        letter-spacing: 0.06em !important;
        word-spacing: 0.12em !important;
      }
    `);
  }
  if (s.lineHeight) {
    rules.push(`
      body, p, li, td, th, label { line-height: 2 !important; }
    `);
  }
  if (s.stopAnimations) {
    rules.push(`
      *, *::before, *::after {
        animation-duration: 0.001s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001s !important;
        scroll-behavior: auto !important;
      }
    `);
  }
  if (s.hideImages) {
    rules.push(`
      img, picture, video, svg:not(.a11y-icon) { visibility: hidden !important; }
    `);
  }
  if (s.dyslexiaFont) {
    rules.push(`
      body, p, span, li, td, th, label, input, textarea, button, h1, h2, h3, h4, h5, h6 {
        font-family: 'Verdana', 'Arial', sans-serif !important;
        letter-spacing: 0.04em !important;
      }
    `);
  }
  if (s.bigCursor) {
    rules.push(`
      *, *::before, *::after {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path d="M3 2l18 9-8 2-2 8z" fill="black" stroke="white" stroke-width="1.5"/></svg>') 0 0, auto !important;
      }
    `);
  }
  if (s.alignLeft) {
    rules.push(`
      body, p, div, li, td, th { text-align: left !important; }
    `);
  }
  if (s.grayscale) {
    rules.push(`html { filter: grayscale(1) !important; }`);
  }

  return rules.join('\n');
}

/**
 * Activa o desactiva una opción. "Texto grande" y "Texto muy grande" se
 * excluyen: prender una apaga la otra.
 */
export function alternarAjuste(ajustes: A11ySettings, clave: keyof A11ySettings): A11ySettings {
  const siguiente = { ...ajustes, [clave]: !ajustes[clave] };
  if (clave === 'bigText' && siguiente.bigText) siguiente.hugeText = false;
  if (clave === 'hugeText' && siguiente.hugeText) siguiente.bigText = false;
  return siguiente;
}
