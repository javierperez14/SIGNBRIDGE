// Contrato frontend → backend: cada función del cliente llama al endpoint y
// método que espera FastAPI. Si alguien renombra una ruta en un lado y no en
// el otro, este test lo dice antes de que falle en producción.
// Autor: @juan-soto350 · Capa S2: Front
import type { AxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it } from 'vitest';
import api, {
  adminUsersApi, authApi, dashboardApi, favoritesApi, feedbackApi, lastSession,
  notificationsApi, statsApi, supportApi, translationApi,
} from './client';

let ultima: AxiosRequestConfig;

beforeEach(() => {
  // Adaptador falso: en vez de salir a la red, guarda la petición y responde 200
  api.defaults.adapter = async config => {
    ultima = config;
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
});

const cuerpo = () => (typeof ultima.data === 'string' ? JSON.parse(ultima.data) : ultima.data);

describe('contrato de rutas con el backend', () => {
  it.each([
    ['authApi.me', () => authApi.me(), 'get', '/auth/me'],
    ['authApi.getCities', () => authApi.getCities(), 'get', '/auth/cities'],
    ['authApi.forgotPassword', () => authApi.forgotPassword('a@b.co'), 'post', '/auth/forgot-password'],
    ['dashboardApi.admin', () => dashboardApi.admin(), 'get', '/dashboard/admin'],
    ['dashboardApi.user', () => dashboardApi.user(), 'get', '/dashboard/user'],
    ['dashboardApi.stats', () => dashboardApi.stats(), 'get', '/dashboard/stats'],
    ['dashboardApi.roles', () => dashboardApi.roles(), 'get', '/dashboard/roles'],
    ['dashboardApi.lexicalUnits', () => dashboardApi.lexicalUnits(), 'get', '/dashboard/lexical-units'],
    ['dashboardApi.lexicalUnitsAdmin', () => dashboardApi.lexicalUnitsAdmin(), 'get', '/dashboard/lexical-units/admin'],
    ['dashboardApi.createLexicalUnit', () => dashboardApi.createLexicalUnit({ text: 'hola', language: 'es_Co' }), 'post', '/dashboard/lexical-units'],
    ['dashboardApi.updateLexicalUnitVideo', () => dashboardApi.updateLexicalUnitVideo('lu1', null), 'patch', '/dashboard/lexical-units/lu1/video'],
    ['dashboardApi.uploadLexicalUnitVideo', () => dashboardApi.uploadLexicalUnitVideo('lu1', new File(['x'], 'v.mp4')), 'post', '/dashboard/lexical-units/lu1/video-file'],
    ['dashboardApi.deleteLexicalUnit', () => dashboardApi.deleteLexicalUnit('lu1'), 'delete', '/dashboard/lexical-units/lu1'],
    ['adminUsersApi.updateRole', () => adminUsersApi.updateRole('u1', 'Soporte'), 'patch', '/dashboard/users/u1/role'],
    ['adminUsersApi.setActive', () => adminUsersApi.setActive('u1', false), 'patch', '/admin/users/u1/status'],
    ['adminUsersApi.exportCsv', () => adminUsersApi.exportCsv(), 'get', '/admin/users/export'],
    ['translationApi.confirmarPalabra', () => translationApi.confirmarPalabra('s1', 'vida'), 'post', '/api/traduccion/frame/palabra'],
    ['feedbackApi.list', () => feedbackApi.list(), 'get', '/feedback/my'],
    ['feedbackApi.wordSummary', () => feedbackApi.wordSummary('lu1'), 'get', '/feedback/word/lu1/summary'],
    ['feedbackApi.listAll', () => feedbackApi.listAll(), 'get', '/feedback/all'],
    ['feedbackApi.quickReplies', () => feedbackApi.quickReplies(), 'get', '/feedback/quick-replies'],
    ['feedbackApi.remove', () => feedbackApi.remove('f1'), 'delete', '/feedback/f1'],
    ['supportApi.list', () => supportApi.list(), 'get', '/support/my'],
    ['supportApi.listAll', () => supportApi.listAll(), 'get', '/support/all'],
    ['favoritesApi.list', () => favoritesApi.list(), 'get', '/favorites/my'],
    ['favoritesApi.toggle', () => favoritesApi.toggle('lu1'), 'post', '/favorites/lu1'],
    ['favoritesApi.add', () => favoritesApi.add('lu1'), 'post', '/favorites/lu1'],
    ['favoritesApi.remove', () => favoritesApi.remove('lu1'), 'post', '/favorites/lu1'],
    ['statsApi.misPalabras', () => statsApi.misPalabras(), 'get', '/stats/mias/palabras?limite=10'],
    ['statsApi.miActividad', () => statsApi.miActividad(7), 'get', '/stats/mias/actividad?dias=7'],
    ['statsApi.misCanales', () => statsApi.misCanales(), 'get', '/stats/mias/canales'],
    ['statsApi.miHistorial', () => statsApi.miHistorial(), 'get', '/stats/mias/historial?dias=30'],
    ['statsApi.miHistorial (con búsqueda)', () => statsApi.miHistorial(7, 'buenas noches'), 'get', '/stats/mias/historial?dias=7&q=buenas%20noches'],
    ['statsApi.exportarHistorialPDF', () => statsApi.exportarHistorialPDF(30, 'á'), 'get', '/stats/mias/historial/pdf?dias=30&q=%C3%A1'],
    ['statsApi.eliminarDeHistorial', () => statsApi.eliminarDeHistorial('s1'), 'delete', '/stats/mias/historial/s1'],
    ['statsApi.palabrasGlobales', () => statsApi.palabrasGlobales(5), 'get', '/stats/globales/palabras?limite=5'],
    ['statsApi.actividadGlobal', () => statsApi.actividadGlobal(), 'get', '/stats/globales/actividad?dias=30'],
    ['statsApi.canalesGlobales', () => statsApi.canalesGlobales(), 'get', '/stats/globales/canales'],
    ['statsApi.resumenInteraccion', () => statsApi.resumenInteraccion(), 'get', '/stats/globales/resumen'],
    ['statsApi.senasSinUsar', () => statsApi.senasSinUsar(), 'get', '/stats/globales/sin-usar'],
    ['statsApi.resumenTickets', () => statsApi.resumenTickets(), 'get', '/stats/globales/tickets'],
    ['statsApi.miProgreso', () => statsApi.miProgreso(), 'get', '/stats/mias/progreso'],
    ['notificationsApi.list', () => notificationsApi.list(true, 5), 'get', '/notifications?solo_sin_leer=true&limite=5'],
    ['notificationsApi.unreadCount', () => notificationsApi.unreadCount(), 'get', '/notifications/unread-count'],
    ['notificationsApi.markRead', () => notificationsApi.markRead('n1'), 'patch', '/notifications/n1/read'],
    ['notificationsApi.markAllRead', () => notificationsApi.markAllRead(), 'patch', '/notifications/read-all'],
    ['notificationsApi.remove', () => notificationsApi.remove('n1'), 'delete', '/notifications/n1'],
  ])('%s → %s %s', async (_nombre, llamar, metodo, url) => {
    await llamar();

    expect(ultima.method).toBe(metodo);
    expect(ultima.url).toBe(url);
  });
});

describe('cuerpos que el backend espera con otro nombre', () => {
  it('login sends email and password', async () => {
    await authApi.login('a@b.co', 'Clave123*');
    expect(cuerpo()).toEqual({ email: 'a@b.co', password: 'Clave123*' });
  });

  it('reset password sends the token and new_password', async () => {
    await authApi.resetPassword('tok', 'Nueva123*');
    expect(cuerpo()).toEqual({ token: 'tok', new_password: 'Nueva123*' });
  });

  it('delete account sends the password in the body of the DELETE', async () => {
    await authApi.deleteAccount('Clave123*');
    expect([ultima.method, ultima.url, cuerpo()]).toEqual(['delete', '/auth/me', { password: 'Clave123*' }]);
  });

  it('register posts the whole form', async () => {
    const datos = { first_name: 'Ana', last_name: 'Paz', phone: '3001234567', city: 'Cali', address: 'Cra 1', email: 'a@b.co', password: 'Clave123*' };
    await authApi.register(datos);
    expect([ultima.url, cuerpo()]).toEqual(['/auth/register', datos]);
  });

  it('support ticket maps "description" to the "message" field of the API', async () => {
    await supportApi.create({ subject: 'No carga', description: 'El video no carga' });
    expect([ultima.url, cuerpo()]).toEqual(['/support', { subject: 'No carga', message: 'El video no carga' }]);
  });

  it('support status sends solution null when there is none', async () => {
    await supportApi.updateStatus('t1', 'in_progress');
    expect([ultima.url, cuerpo()]).toEqual(['/support/t1/status', { status: 'in_progress', solution: null }]);
  });

  it('feedback sends null for the fields that were not given', async () => {
    await feedbackApi.create({ id_lexicalunit: 'lu1', rating: 5 });
    expect(cuerpo()).toEqual({ id_session: null, id_lexicalunit: 'lu1', rating: 5, comment: null });
  });

  it('feedback review maps quickReplyKey to quick_reply', async () => {
    await feedbackApi.setReviewed('f1', true, { quickReplyKey: 'gracias' });
    expect([ultima.url, cuerpo()]).toEqual(['/feedback/f1/review', { is_reviewed: true, response: null, quick_reply: 'gracias' }]);
  });

  it.each([
    [undefined, { texto: 'hola' }],
    ['s1', { texto: 'hola', session_id: 's1' }],
  ])('text translation with session %s', async (sesion, esperado) => {
    await translationApi.textToSign('hola', sesion);
    expect([ultima.url, cuerpo()]).toEqual(['/api/traduccion/texto', esperado]);
  });

  it('voice translation sends the dictated text and the language', async () => {
    await translationApi.vozToSign('hola', 's1');
    expect([ultima.url, cuerpo()]).toEqual(['/api/traduccion/voz', { texto_dictado: 'hola', idioma: 'es-CO', session_id: 's1' }]);
  });

  it('frame detection uses the field frame_base64', async () => {
    await translationApi.signToText('AAAA');
    expect([ultima.url, cuerpo()]).toEqual(['/api/traduccion/frame', { frame_base64: 'AAAA' }]);
  });

  it.each([
    [undefined, undefined],
    [true, { is_active: true }],
    [false, { is_active: false }],
  ])('admin users filter is_active=%s', async (activo, params) => {
    await adminUsersApi.list(activo);
    expect(ultima.params).toEqual(params);
  });
});

describe('interceptores', () => {
  it('should add the Bearer token saved at login to every request', async () => {
    localStorage.setItem('token', 'abc123');
    await authApi.me();
    expect(ultima.headers?.Authorization).toBe('Bearer abc123');
  });

  it('should not send Authorization when there is no session', async () => {
    await authApi.me();
    expect(ultima.headers?.Authorization).toBeUndefined();
  });
});

describe('lastSession', () => {
  it('should save, read and forget the last translation session', () => {
    lastSession.set('s1');
    expect(lastSession.get()).toBe('s1');
    lastSession.clear();
    expect(lastSession.get()).toBeNull();
  });
});
