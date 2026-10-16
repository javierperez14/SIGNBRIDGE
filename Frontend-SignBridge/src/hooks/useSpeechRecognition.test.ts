// El reconocimiento de voz del navegador se reemplaza por uno falso que el
// test controla: así se prueba la lógica del hook sin micrófono ni red.
// Autor: @juan-soto350 · Capa S2: Front
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useSpeechRecognition } from './useSpeechRecognition';

class ReconocimientoFalso {
  static ultimo: ReconocimientoFalso;
  lang = ''; continuous = true; interimResults = false; maxAlternatives = 0;
  onstart: (() => void) | null = null;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  detenido = false;
  constructor() { ReconocimientoFalso.ultimo = this; }
  start() { this.onstart?.(); }
  stop() { this.detenido = true; this.onend?.(); }
  abort() {}
}

/** Simula lo que entrega el navegador: [texto, ¿es final?] por cada resultado */
function resultados(...partes: [string, boolean][]) {
  const results = partes.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal }));
  return { resultIndex: 0, results };
}

afterEach(() => {
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
});

describe('useSpeechRecognition', () => {
  it('should report "unsupported" and explain why when the browser has no speech API', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => result.current.startListening());

    expect(result.current.state).toBe('unsupported');
    expect(result.current.isSupported).toBe(false);
    expect(result.current.error).toMatch(/no soporta/);
  });

  it('should listen in Colombian Spanish and go to "processing" with the final text', () => {
    window.webkitSpeechRecognition = ReconocimientoFalso as never;
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => result.current.startListening());
    expect(result.current.state).toBe('listening');
    expect(ReconocimientoFalso.ultimo.lang).toBe('es-CO');

    act(() => ReconocimientoFalso.ultimo.onresult?.(resultados(['hola ami', false])));
    expect(result.current.transcript).toBe('hola ami');

    act(() => ReconocimientoFalso.ultimo.onresult?.(resultados([' hola amigo ', true])));
    expect(result.current.transcript).toBe('hola amigo');
    expect(result.current.state).toBe('processing');
  });

  it.each([
    ['not-allowed', 'Permiso de micrófono denegado'],
    ['no-speech', 'No se detectó voz'],
    ['network', 'Error de red'],
    ['aborted', 'Error en el reconocimiento de voz: aborted'],
  ])('error "%s" → "%s"', (codigo, mensaje) => {
    window.SpeechRecognition = ReconocimientoFalso as never;
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.startListening());

    act(() => ReconocimientoFalso.ultimo.onerror?.({ error: codigo }));

    expect(result.current.error).toContain(mensaje);
    expect(result.current.state).toBe('idle');
  });

  it('should stop listening and clear everything on reset', () => {
    window.SpeechRecognition = ReconocimientoFalso as never;
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => result.current.startListening());
    act(() => ReconocimientoFalso.ultimo.onresult?.(resultados(['hola', true])));

    act(() => result.current.stopListening());
    expect(ReconocimientoFalso.ultimo.detenido).toBe(true);

    act(() => result.current.resetTranscript());
    expect([result.current.transcript, result.current.error, result.current.state]).toEqual(['', null, 'idle']);
  });
});
