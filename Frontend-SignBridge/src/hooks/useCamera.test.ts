// La cámara del navegador (getUserMedia) se reemplaza por una falsa.
// Autor: @juan-soto350 · Capa S2: Front
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCamera } from './useCamera';

const pista = { stop: vi.fn() };
const streamFalso = { getTracks: () => [pista] } as unknown as MediaStream;

function camara(getUserMedia?: () => Promise<MediaStream>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: getUserMedia ? { getUserMedia } : undefined,
    configurable: true,
  });
}

afterEach(() => camara());

describe('useCamera', () => {
  it('should be "unavailable" when the browser cannot access cameras', async () => {
    camara();
    const { result } = renderHook(() => useCamera());

    await act(() => result.current.requestCamera());

    expect(result.current.permission).toBe('unavailable');
    expect(result.current.error).toMatch(/no soporta/);
  });

  it('should keep the stream and set "granted" when the person allows the camera', async () => {
    camara(async () => streamFalso);
    const { result } = renderHook(() => useCamera());

    await act(() => result.current.requestCamera());

    expect(result.current.permission).toBe('granted');
    expect(result.current.stream).toBe(streamFalso);
  });

  it.each([
    ['NotAllowedError', 'denied', 'Permiso de cámara denegado'],
    ['PermissionDeniedError', 'denied', 'Permiso de cámara denegado'],
    ['NotFoundError', 'unavailable', 'No se encontró una cámara'],
    ['NotReadableError', 'unavailable', 'usada por otra aplicación'],
    ['OverconstrainedError', 'denied', 'No se pudo acceder a la cámara'],
  ])('error %s → permiso "%s"', async (nombre, permiso, mensaje) => {
    camara(async () => { throw Object.assign(new Error('x'), { name: nombre }); });
    const { result } = renderHook(() => useCamera());

    await act(() => result.current.requestCamera());

    expect(result.current.permission).toBe(permiso);
    expect(result.current.error).toContain(mensaje);
  });

  it('should stop every track and go back to "idle" when the camera is turned off', async () => {
    camara(async () => streamFalso);
    const { result } = renderHook(() => useCamera());
    await act(() => result.current.requestCamera());

    act(() => result.current.stopCamera());

    expect(pista.stop).toHaveBeenCalled();
    expect([result.current.permission, result.current.stream]).toEqual(['idle', null]);
  });

  it('should not capture a frame while there is no video playing', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.captureFrame()).toBeNull();
  });
});
