import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    // carga. Si el wrapper `RequireUnverified` desapareciera de App.tsx, la
    // página de verificación se montaría y este texto nunca aparecería.
    await waitFor(() => {
      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();

    releaseMe(verifiedUser);

    expect(await screen.findByText('Bienvenido, Verified User')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();
  });

  it('redirige al login a un usuario anónimo y nunca muestra la página', async () => {
    render(
      <QueryClientProvider client={newQueryClient()}>
        <MemoryRouter initialEntries={['/verify-email']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reenviar/i })).not.toBeInTheDocument();
  });

  it('un usuario no verificado que inicia sesión termina en /verify-email', async () => {
    // El backend ahora deja iniciar sesión a cuentas sin verificar. LoginPage
    // navega a `from` (/dashboard) y ProtectedRoute redirige a /verify-email:
    // esta cadena reemplaza al viejo branch de error "no verificada".
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({
          success: true,
          message: 'Login exitoso',
          data: { user: unverifiedUser, accessToken: 'token', expiresIn: 3600 },
        }),
      ),
    );

    render(
      <QueryClientProvider client={newQueryClient()}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole('heading', { name: 'Iniciar sesión' });
    fireEvent.change(screen.getByPlaceholderText('admin@test.com'), {
      target: { value: 'unverified@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    // Bajo carga el flujo login → /dashboard → /verify-email pasa por componentes
    // lazy, así que damos margen al timeout por defecto de Testing Library.
    expect(
      await screen.findByRole('button', { name: /reenviar/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('unverified@test.com')).toBeInTheDocument();
  });

  it('un usuario recién registrado auto-loguea y llega a /verify-email', async () => {
    // Registro sin auto-login ya no es viable: /verify-email exige sesión. El
    // flujo real es register → auto-login → guard RequireUnverified.
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: { ...unverifiedUser, email: 'new@test.com', name: 'Nuevo Usuario' },
            accessToken: 'token',
            expiresIn: 3600,
          },
        }),
      ),
    );

    render(
      <QueryClientProvider client={newQueryClient()}>
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole('heading', { name: 'Registrarse' });
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Nuevo Usuario' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'new@test.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(
      await screen.findByRole('button', { name: /reenviar/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('new@test.com')).toBeInTheDocument();
  });
});
