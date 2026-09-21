import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import VerifyEmailPage from './VerifyEmailPage';
import { AuthProvider } from '../../auth';
import { RedirectIfVerified } from '../../auth/guards';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';
import { authStorage } from '../../lib/auth/token-store';
import { server } from '../../test/mocks/server';
import type { User } from '../../lib/api/types/api-response';
import '../../lib/i18n/config';

const verifiedUser: User = {
  id: '1',
  email: 'verified@test.com',
  name: 'Verified User',
  roles: ['viewer'],
  permissions: [],
  isVerified: true,
};

const unverifiedUser: User = {
  ...verifiedUser,
  id: '2',
  email: 'unverified@test.com',
  name: 'Unverified User',
  isVerified: false,
};

function newQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function authValue(user: User): AuthContextValue {
  return {
    user,
    token: 'token',
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    hasPrivilege: () => false,
    hasAnyPrivilege: () => false,
    hasRole: (role) => user.roles.includes(role),
    isVerified: () => user.isVerified,
  };
}

/** Monta la ruta real con el guard, restaurando la sesión vía MSW (/auth/me). */
function renderGuardedRoute(user: User) {
  server.use(
    http.get('*/auth/me', () => HttpResponse.json({ success: true, message: 'ok', data: user })),
  );
  authStorage.setActiveSession(false, 3600);

  return render(
    <QueryClientProvider client={newQueryClient()}>
      <MemoryRouter initialEntries={['/verify-email']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/verify-email"
              element={
                <RedirectIfVerified>
                  <VerifyEmailPage />
                </RedirectIfVerified>
              }
            />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Monta la página sin guard para ejercitar el ocultamiento del control. */
function renderPageDirect(user: User) {
  return render(
    <QueryClientProvider client={newQueryClient()}>
      <AuthContext.Provider value={authValue(user)}>
        <MemoryRouter initialEntries={['/verify-email']}>
          <VerifyEmailPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  authStorage.clearAll();
  server.resetHandlers();
});

describe('RedirectIfVerified — ruta /verify-email', () => {
  it('redirige al dashboard a un usuario verificado y no muestra reenviar', async () => {
    renderGuardedRoute(verifiedUser);

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();
  });

  it('deja ver la página y el reenvío a un usuario autenticado sin verificar', async () => {
    renderGuardedRoute(unverifiedUser);

    expect(await screen.findByRole('button', { name: /reenviar/i })).toBeInTheDocument();
    expect(screen.getByText('unverified@test.com')).toBeInTheDocument();
  });
});

describe('VerifyEmailPage — reenvío inalcanzable cuando está verificado', () => {
  it('oculta el botón de reenvío a un usuario autenticado y verificado', () => {
    renderPageDirect(verifiedUser);

    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();
    // El cierre de sesión sigue disponible: la pantalla no queda muerta.
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('muestra el botón de reenvío a un usuario autenticado sin verificar', () => {
    renderPageDirect(unverifiedUser);

    expect(screen.getByRole('button', { name: /reenviar/i })).toBeInTheDocument();
  });
});
