// Autor: @juan-soto350 · Capa S2: Front
import { describe, expect, it } from 'vitest';
import { esYouTube, idDeYouTube, urlCompleta, urlEmbedYouTube } from './video';

describe('urlCompleta', () => {
  it.each([
    ['/media/videos/hola.mp4', 'http://api.test/media/videos/hola.mp4'],
    ['https://cdn.test/hola.mp4', 'https://cdn.test/hola.mp4'],
    ['http://cdn.test/hola.mp4', 'http://cdn.test/hola.mp4'],
    ['', ''],
  ])('"%s" → "%s"', (url, esperado) => {
    expect(urlCompleta(url, 'http://api.test')).toBe(esperado);
  });
});

describe('idDeYouTube', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123', 'abc123'],
    ['https://www.youtube.com/watch?list=x&v=abc123', 'abc123'],
    ['https://youtu.be/abc123?t=4', 'abc123'],
    ['https://www.youtube.com/embed/abc123?autoplay=1', 'abc123'],
    ['/media/videos/hola.mp4', null],
    ['', null],
  ])('"%s" → %s', (url, id) => {
    expect(idDeYouTube(url)).toBe(id);
  });
});

describe('esYouTube', () => {
  it.each([
    ['https://youtu.be/abc123', true],
    ['https://www.youtube.com/watch?v=abc123', true],
    ['/media/videos/hola.mp4', false],
    ['', false],
  ])('"%s" → %s', (url, esperado) => {
    expect(esYouTube(url)).toBe(esperado);
  });
});

describe('urlEmbedYouTube', () => {
  it('should convert watch and short URLs to embed URLs', () => {
    expect(urlEmbedYouTube('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123');
  });

  it('should keep an embed URL with its parameters untouched', () => {
    const url = 'https://www.youtube.com/embed/abc123?autoplay=1';
    expect(urlEmbedYouTube(url)).toBe(url);
  });

  it('should leave non YouTube URLs as they are', () => {
    expect(urlEmbedYouTube('/media/videos/hola.mp4')).toBe('/media/videos/hola.mp4');
  });
});
