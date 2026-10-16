// La campana de avisos: contador, lista y "marcar todas como leídas".
// Autor: @juan-soto350 · Capa S2: Front
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notificationsApi } from '../api/client';
import { renderEnRuta } from '../test/render';
import { NotificationBell } from './NotificationBell';

const AVISOS = [
  { id_notification: 'n1', type: 'ticket_resolved', title: 'Tu ticket fue resuelto', body: 'Ya funciona', read_at: null, created_at: new Date().toISOString() },
  { id_notification: 'n2', type: 'feedback_answered', title: 'Soporte respondió tu valoración', read_at: '2026-10-01T10:00:00Z', created_at: '2026-10-01T10:00:00Z' },
];

beforeEach(() => {
  vi.spyOn(notificationsApi, 'list').mockResolvedValue({ data: AVISOS } as never);
  vi.spyOn(notificationsApi, 'markRead').mockResolvedValue({ data: {} } as never);
});

describe('NotificationBell', () => {
  it.each([
    [0, 'Notificaciones', null],
    [3, 'Notificaciones, 3 sin leer', '3'],
    [12, 'Notificaciones, 12 sin leer', '9+'],   // el globo no pasa de 9+
  ])('with %i unread the button is "%s"', async (sinLeer, nombre, globo) => {
    vi.spyOn(notificationsApi, 'unreadCount').mockResolvedValue({ data: { unread: sinLeer } } as never);

    renderEnRuta(<NotificationBell />);

    const boton = await screen.findByRole('button', { name: nombre });
    if (globo) expect(boton).toHaveTextContent(globo);
  });

  it('should list the notifications and mark them all as read', async () => {
    vi.spyOn(notificationsApi, 'unreadCount').mockResolvedValue({ data: { unread: 1 } } as never);
    const marcarTodas = vi.spyOn(notificationsApi, 'markAllRead').mockResolvedValue({ data: { updated: 1, unread: 0 } } as never);
    renderEnRuta(<NotificationBell />);

    await userEvent.click(await screen.findByRole('button', { name: 'Notificaciones, 1 sin leer' }));
    expect(await screen.findByText('Tu ticket fue resuelto')).toBeInTheDocument();
    expect(screen.getByText('Soporte respondió tu valoración')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }));

    expect(marcarTodas).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Marcar todas como leídas' })).not.toBeInTheDocument());
  });

  it('should say so when there are no notifications', async () => {
    vi.spyOn(notificationsApi, 'unreadCount').mockResolvedValue({ data: { unread: 0 } } as never);
    vi.spyOn(notificationsApi, 'list').mockResolvedValue({ data: [] } as never);
    renderEnRuta(<NotificationBell />);

    await userEvent.click(await screen.findByRole('button', { name: 'Notificaciones' }));

    expect(await screen.findByText('No tenés notificaciones todavía.')).toBeInTheDocument();
  });
});
