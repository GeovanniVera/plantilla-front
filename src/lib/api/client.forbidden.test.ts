import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { client, configureClient, shouldRedirectToForbidden } from './client';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('shouldRedirectToForbidden — decisión de onForbidden', () => {
  it('no redirige si ya estamos en /403 (evita el loop de recargas)', () => {
    expect(shouldRedirectToForbidden('/403')).toBe(false);
  });

  it('no redirige desde /login (403 = cuenta no verificada)', () => {
    expect(shouldRedirectToForbidden('/login')).toBe(false);
  });

  it('redirige desde cualquier otra ruta', () => {
    expect(shouldRedirectToForbidden('/dashboard')).toBe(true);
  });
});

describe('onForbidden por defecto — navegación', () => {
  const originalLocation = window.location;
  let locationMock: { pathname: string; href: string };

  beforeEach(() => {
    // Solo se ajusta la base URL: onForbidden sigue siendo el default bajo prueba.
    configureClient({ baseUrl: '/api' });
    locationMock = { pathname: '/403', href: 'http://localhost/403' };
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: locationMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  function forbiddenResponse() {
    return HttpResponse.json(
      { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    );
  }

  it('no navega cuando la ruta ya es /403', async () => {
    server.use(http.get('/api/blocked', forbiddenResponse));

    await client.get('/blocked');

    expect(locationMock.href).toBe('http://localhost/403');
  });

  it('navega a /403 cuando la ruta no es /403', async () => {
    locationMock.pathname = '/dashboard';
    locationMock.href = 'http://localhost/dashboard';
    server.use(http.get('/api/blocked', forbiddenResponse));

    await client.get('/blocked');

    expect(locationMock.href).toBe('/403');
  });
});
