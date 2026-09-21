import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import App from './App';
import { authStorage } from './lib/auth/token-store';
import { server } from './test/mocks/server';
import type { User } from './lib/api/types/api-response';
import './lib/i18n/config';

// jsdom no implementa matchMedia y el Sidebar de MainLayout lo consulta vía
// useIsMobile/useMediaQuery. Sin el polyfill, el ErrorBoundary captura el
// TypeError al llegar al dashboard.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * Storage en memoria para aislar cada test del storage global de jsdom.
 *
 * El suite comparte globals entre archivos, así que sembrar un token en el
 * storage real filtraría la sesión a otros tests. Se reemplazan ambos storages
 * y se limpia `authStorage` antes y después de cada caso.
 */
function memoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

const verifiedUser: User = {
  id: '1',
  email: 'verified@test.com',
  name: 'Verified User',
  roles: ['viewer'],
  permissions: [],
  isVerified: true,
};

function newQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe('App — cableado de la ruta /verify-email', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage());
    authStorage.clearAll();
  });

  afterEach(() => {
    authStorage.clearAll();
    vi.unstubAllGlobals();
  });

  it('redirige al dashboard a un usuario verificado y nunca muestra el reenvío', async () => {
    // `/auth/me` queda bloqueado a propósito: así se distingue el redirect del
    // guard (síncrono, antes de montar la página) del useEffect de la propia
    // página, que también navega al dashboard una vez que el usuario verificado
    // ya está en el contexto.
    let releaseMe: (user: User) => void = () => {};
    const meGate = new Promise<User>((resolve) => {
      releaseMe = resolve;
    });
    server.use(
      http.get('*/auth/me', async () => {
        const user = await meGate;
        return HttpResponse.json({ success: true, message: 'ok', data: user });
      }),
    );
    authStorage.setActiveSession(false, 3600);

    render(
      <QueryClientProvider client={newQueryClient()}>
        <MemoryRouter initialEntries={['/verify-email']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Mientras la sesión está en restauración, el guard muestra su pantalla de
    // carga. Si el wrapper `RedirectIfVerified` desapareciera de App.tsx, la
    // página de verificación se montaría y este texto nunca aparecería.
    await waitFor(() => {
      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();

    releaseMe(verifiedUser);

    expect(await screen.findByText('Bienvenido, Verified User')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();
  });
});
