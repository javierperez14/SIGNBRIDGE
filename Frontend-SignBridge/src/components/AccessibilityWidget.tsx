import { useEffect, useRef, useState } from 'react';
import {
  alternarAjuste, buildCss, DEFAULT_SETTINGS, loadSettings, STORAGE_KEY, type A11ySettings,
} from '../utils/accesibilidad';

// Los ajustes, su almacenamiento y el CSS que generan están en utils/accesibilidad.ts

// ─────────────────────────────────────────────────────────────────────────────
// Lectura de página (Web Speech API)
// ─────────────────────────────────────────────────────────────────────────────

function readPageAloud() {
  if (!('speechSynthesis' in window)) {
    alert('Tu navegador no soporta lectura de voz.');
    return;
  }
  window.speechSynthesis.cancel();
  const main = document.querySelector('main') ?? document.body;
  const text = (main.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000);
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-CO';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function stopReading() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─────────────────────────────────────────────────────────────────────────────
// Botón individual del panel
// ─────────────────────────────────────────────────────────────────────────────

function A11yButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={!!active}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
        border: active ? '1.5px solid var(--violet)' : '1.5px solid var(--gray-100)',
        background: active ? 'var(--violet)' : 'var(--white)',
        color: active ? 'white' : 'var(--gray-700)',
        transition: 'all 0.15s', fontFamily: 'var(--font-body)',
        minHeight: 76,
      }}
    >
      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(() => loadSettings());
  const [reading, setReading] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.id = 'a11y-widget-styles';
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    styleRef.current.textContent = buildCss(settings);
    // El modo claro cambia la paleta completa con data-theme (definida en
    // index.css), en vez de invertir la pantalla con un filtro.
    if (settings.lightMode) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (key: keyof A11ySettings) => setSettings(prev => alternarAjuste(prev, key));

  const handleReadToggle = () => {
    if (reading) {
      stopReading();
      setReading(false);
    } else {
      readPageAloud();
      setReading(true);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    stopReading();
    setReading(false);
  };

  const anyActive = Object.values(settings).some(Boolean);

  return (
    <>
      {/* Región para lectores de pantalla: anuncia el estado de la lectura en voz */}
      <div
        aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {reading ? 'Lectura de página iniciada' : 'Lectura de página detenida'}
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir menú de accesibilidad"
        aria-expanded={open}
        style={{
          position: 'fixed', bottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))',
          right: 'max(16px, env(safe-area-inset-right))', zIndex: 5000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--violet)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(40,35,188,0.4)',
          color: 'white', fontSize: '1.5rem',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        <svg className="a11y-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="4.5" r="1.8" fill="white"/>
          <path d="M4 8.5c3-1 13-1 16 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 8.5v11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 12.5c-1.8 2.5-3.2 4-5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 12.5c1.8 2.5 3.2 4 5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        {anyActive && (
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 12, height: 12,
            borderRadius: '50%', background: 'var(--amber)', border: '2px solid white',
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Menú de accesibilidad"
          style={{
            position: 'fixed', bottom: 'max(152px, calc(env(safe-area-inset-bottom) + 152px))',
            right: 'max(16px, env(safe-area-inset-right))', zIndex: 5000,
            // En pantallas angostas el panel de 340px se salia del viewport.
            width: 'min(340px, calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 190px)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'var(--white)', borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '1px solid var(--gray-100)',
          }}
        >
          <div style={{
            padding: '16px 18px', borderBottom: '1px solid var(--gray-100)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, background: 'var(--white)', borderRadius: '16px 16px 0 0',
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>
                Menú de accesibilidad
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>SignBridge</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú de accesibilidad"
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: 'var(--gray-100)', color: 'var(--gray-600)', cursor: 'pointer',
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            overflowY: 'auto', flex: 1, minHeight: 0,
          }}>
            <A11yButton icon={reading ? '⏹️' : '🔊'} label={reading ? 'Detener lectura' : 'Leer página'} active={reading} onClick={handleReadToggle} />
            <A11yButton icon="A+" label="Texto grande" active={settings.bigText} onClick={() => toggle('bigText')} />
            <A11yButton icon="A++" label="Texto muy grande" active={settings.hugeText} onClick={() => toggle('hugeText')} />
            <A11yButton icon="◐" label="Contraste +" active={settings.highContrast} onClick={() => toggle('highContrast')} />
            <A11yButton icon="☀" label="Modo claro" active={settings.lightMode} onClick={() => toggle('lightMode')} />
            <A11yButton icon="🔗" label="Resaltar enlaces" active={settings.highlightLinks} onClick={() => toggle('highlightLinks')} />
            <A11yButton icon="⇔" label="Espaciado de texto" active={settings.textSpacing} onClick={() => toggle('textSpacing')} />
            <A11yButton icon="≡" label="Altura de línea" active={settings.lineHeight} onClick={() => toggle('lineHeight')} />
            <A11yButton icon="⏸" label="Detener animaciones" active={settings.stopAnimations} onClick={() => toggle('stopAnimations')} />
            <A11yButton icon="🖼️" label="Ocultar imágenes" active={settings.hideImages} onClick={() => toggle('hideImages')} />
            <A11yButton icon="Df" label="Apto para dislexia" active={settings.dyslexiaFont} onClick={() => toggle('dyslexiaFont')} />
            <A11yButton icon="⭑" label="Cursor grande" active={settings.bigCursor} onClick={() => toggle('bigCursor')} />
            <A11yButton icon="◀" label="Texto alineado" active={settings.alignLeft} onClick={() => toggle('alignLeft')} />
            <A11yButton icon="◒" label="Escala de grises" active={settings.grayscale} onClick={() => toggle('grayscale')} />
          </div>

          <div style={{
            padding: '12px 16px', flexShrink: 0,
            borderTop: '1px solid var(--gray-100)', background: 'var(--white)',
          }}>
            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                background: 'var(--violet)', color: 'white', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              🔄 Restablecer todo
            </button>
          </div>
        </div>
      )}
    </>
  );
}