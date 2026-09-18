import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import RolesPage from './RolesPage';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';
import type { User } from '../../lib/api/types/api-response';
import { ToastProvider } from '@components/feedback';
import { server } from '../../test/mocks/server';

// jsdom no implementa matchMedia y ResponsiveTable lo consulta vía useMediaQuery.
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

// La ruta /admin/roles solo exige roles.read. El RoleDrawer montado allí pide
// /admin/permissions (requiere permissions.read): sin ese privilegio el backend
// responde 403 y onForbidden redirige a /403.
const rolesOnly: User = {
  id: '1',
  email: 'roles@test.com',
  name: 'Roles Reader',
  roles: ['viewer'],
  permissions: ['roles.read'],
  isVerified: true,
};

const rolesAndPermissions: User = {
  ...rolesOnly,
  permissions: ['roles.read', 'permissions.read'],
};

const listedRole = {
  id: 'r1',
  name: 'viewer',
  description: 'Rol base',
  permissions: [],
};

function authValue(user: User): AuthContextValue {
  return {
    user,
    token: 'token',
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    hasPrivilege: (privilege) => user.permissions.includes(privilege),
    hasAnyPrivilege: (privileges) =>
      privileges.some((privilege) => user.permissions.includes(privilege)),
    hasRole: (role) => user.roles.includes(role),
    isVerified: () => user.isVerified,
  };
}

let permissionRequests = 0;

beforeEach(() => {
  permissionRequests = 0;
  server.use(
    http.get('*/admin/roles', () =>
      HttpResponse.json({ success: true, message: 'ok', data: [listedRole] }),
    ),
    http.get('*/admin/permissions', () => {
      permissionRequests += 1;
      return HttpResponse.json({ success: true, message: 'ok', data: [] });
    }),
  );
});

function renderPage(user: User) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue(user)}>
          <MemoryRouter initialEntries={['/admin/roles']}>
            <RolesPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('RolesPage — gating de /admin/permissions por privilegio y drawer abierto', () => {
  it('no pide /admin/permissions al montar la página si falta permissions.read', async () => {
    renderPage(rolesOnly);

    await screen.findByText('viewer');
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(permissionRequests).toBe(0);
  });

  it('no pide /admin/permissions ni al abrir el drawer si falta permissions.read', async () => {
    renderPage(rolesOnly);

    fireEvent.click(await screen.findByText('viewer'));
    await screen.findByRole('dialog');
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(permissionRequests).toBe(0);
  });

  it('no pide /admin/permissions con el drawer cerrado y sí al abrirlo con permissions.read', async () => {
    renderPage(rolesAndPermissions);

    await screen.findByText('viewer');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(permissionRequests).toBe(0);

    fireEvent.click(screen.getByText('viewer'));
    await screen.findByRole('dialog');
    await waitFor(() => {
      expect(permissionRequests).toBeGreaterThan(0);
    });
  });
});
