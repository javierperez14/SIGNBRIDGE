// La pantalla principal: escribir texto y ver sus señas LSC en secuencia.
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardApi, lastSession, translationApi } from '../api/client';
import { renderEnRuta } from '../test/render';
import VoiceToSign from './VoiceToSign';

const RESPUESTA = {
  id_session: 'ses-1',
  signs: [
    { word: 'hola', found: true, video_url: '/media/videos/hola.mp4' },
    { word: 'amigo', found: true, video_url: '/media/videos/amigo.mp4' },
  ],
  untranslated_words: [],
  message: 'Traducción completa: 2 seña(s) encontrada(s).',
};

beforeEach(() => {
  // jsdom no reproduce video: play/pause se reemplazan
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(dashboardApi, 'lexicalUnits').mockResolvedValue({ data: [] } as never);
});

const campo = () => screen.getByPlaceholderText('Escribe una palabra, frase o expresión en español…');

describe('VoiceToSign', () => {
  it('should keep "Traducir a señas" disabled while the text is empty', () => {
    renderEnRuta(<VoiceToSign />, '/voice-to-sign');
    expect(screen.getByRole('button', { name: 'Traducir a señas' })).toBeDisabled();
  });

  it('should show one sign per word, in order, and remember the session', async () => {
    const traducir = vi.spyOn(translationApi, 'textToSign').mockResolvedValue({ data: RESPUESTA } as never);
    renderEnRuta(<VoiceToSign />, '/voice-to-sign');

    await userEvent.type(campo(), 'hola amigo');
    await userEvent.click(screen.getByRole('button', { name: 'Traducir a señas' }));

    expect(traducir).toHaveBeenCalledWith('hola amigo', undefined);
    expect(await screen.findByRole('button', { name: '1. hola' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. amigo' })).toBeInTheDocument();
    expect(lastSession.get()).toBe('ses-1');
  });

  it('should reuse the same session for the next translation', async () => {
    const traducir = vi.spyOn(translationApi, 'textToSign').mockResolvedValue({ data: RESPUESTA } as never);
    renderEnRuta(<VoiceToSign />, '/voice-to-sign');

    await userEvent.type(campo(), 'hola');
    await userEvent.click(screen.getByRole('button', { name: 'Traducir a señas' }));
    await screen.findByRole('button', { name: '1. hola' });
    await userEvent.clear(campo());
    await userEvent.type(campo(), 'amigo');
    await userEvent.click(screen.getByRole('button', { name: 'Traducir a señas' }));

    await waitFor(() => expect(traducir).toHaveBeenLastCalledWith('amigo', 'ses-1'));
  });

  it.each([
    ['the API explains the problem', { response: { data: { detail: 'No se encontraron palabras válidas en el texto.' } } }, 'No se encontraron palabras válidas en el texto.'],
    ['the backend is down', new Error('Network Error'), 'Error al traducir. Verifica que el backend esté activo.'],
  ])('should show an error when %s', async (_caso, error, mensaje) => {
    vi.spyOn(translationApi, 'textToSign').mockRejectedValue(error);
    renderEnRuta(<VoiceToSign />, '/voice-to-sign');

    await userEvent.type(campo(), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Traducir a señas' }));

    expect(await screen.findByText(mensaje)).toBeInTheDocument();
  });
});
