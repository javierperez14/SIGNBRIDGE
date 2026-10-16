// Autor: @juan-soto350 · Capa S2: Front
import { describe, expect, it } from 'vitest';
import { alternarAjuste, buildCss, DEFAULT_SETTINGS, loadSettings, STORAGE_KEY } from './accesibilidad';

describe('loadSettings', () => {
  it('should start with everything off', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('should restore what the person saved and fill in options added later', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bigText: true }));
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, bigText: true });
  });

  it('should ignore a corrupted value instead of breaking the page', () => {
    localStorage.setItem(STORAGE_KEY, '{esto no es json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('buildCss', () => {
  it('should not add any rule when everything is off', () => {
    expect(buildCss(DEFAULT_SETTINGS)).toBe('');
  });

  it.each([
    ['bigText', 'font-size: 112%'],
    ['hugeText', 'font-size: 128%'],
    ['highContrast', 'contrast(1.35)'],
    ['highlightLinks', 'outline: 2px solid'],
    ['textSpacing', 'letter-spacing: 0.06em'],
    ['lineHeight', 'line-height: 2'],
    ['stopAnimations', 'animation-duration: 0.001s'],
    ['hideImages', 'visibility: hidden'],
    ['dyslexiaFont', "font-family: 'Verdana'"],
    ['bigCursor', 'cursor: url('],
    ['alignLeft', 'text-align: left'],
    ['grayscale', 'grayscale(1)'],
  ] as const)('%s → "%s"', (opcion, regla) => {
    expect(buildCss({ ...DEFAULT_SETTINGS, [opcion]: true })).toContain(regla);
  });

  it('should not generate CSS for light mode (it changes data-theme instead)', () => {
    expect(buildCss({ ...DEFAULT_SETTINGS, lightMode: true })).toBe('');
  });
});

describe('alternarAjuste', () => {
  it('should turn an option on and off', () => {
    const encendido = alternarAjuste(DEFAULT_SETTINGS, 'grayscale');
    expect(encendido.grayscale).toBe(true);
    expect(alternarAjuste(encendido, 'grayscale').grayscale).toBe(false);
  });

  it.each([
    ['bigText', 'hugeText'],
    ['hugeText', 'bigText'],
  ] as const)('turning on %s turns off %s', (prender, apagada) => {
    const antes = { ...DEFAULT_SETTINGS, [apagada]: true };
    const despues = alternarAjuste(antes, prender);
    expect([despues[prender], despues[apagada]]).toEqual([true, false]);
  });

  it('should not change the original settings object', () => {
    alternarAjuste(DEFAULT_SETTINGS, 'bigText');
    expect(DEFAULT_SETTINGS.bigText).toBe(false);
  });
});
