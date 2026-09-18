import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import UsersPage from './UsersPage';
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

// La ruta /admin/usuarios solo exige users.read. El drawer montado allí pide
// /admin/roles (requiere roles.read): sin ese privilegio el backend responde
// 403 y onForbidden redirige a /403.
const usersOnly: User = {
  id: '1',
  email: 'users@test.com',
  name: 'Users Reader',
  roles: ['viewer'],
  permissions: ['users.read'],
  isVerified: true,
};

const usersAndRoles: User = {
  ...usersOnly,
  permissions: ['users.read', 'roles.read'],
};

// Puede asignar roles pero no leer el catálogo: el estado degradado que el
// drawer cubre sin ofrecer el picker ni permitir el guardado.
const usersAssignOnly: User = {
  ...usersOnly,
  permissions: ['users.read', 'roles.assign'],
};

// Control positivo: ve el catálogo y además puede asignar.
const usersRolesAssign: User = {
  ...usersOnly,
  permissions: ['users.read', 'roles.read', 'roles.assign'],
};

const listedUser = {
  id: 'u1',
  email: 'alice@test.com',
  name: 'Alice',
  roles: ['viewer'],
  isVerified: true,
  suspended: false,
  createdAt: '2026-01-01T00:00:00Z',
};

const catalogRoles = [
  { id: 'r1', name: 'viewer', description: 'Rol base', permissions: [] },
  { id: 'r2', name: 'admin', description: 'Acceso total', permissions: [] },
];

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

let roleRequests = 0;
type AssignmentRequest = { method: string; url: string; body: unknown };
let assignRequests: AssignmentRequest[] = [];

beforeEach(() => {
  roleRequests = 0;
  assignRequests = [];
  server.use(
    http.get('*/admin/users', () =>
      HttpResponse.json({
        success: true,
        message: 'ok',
        data: {
          content: [listedUser],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 10,
        },
      }),
    ),
    http.get('*/admin/roles', () => {
      roleRequests += 1;
      return HttpResponse.json({ success: true, message: 'ok', data: catalogRoles });
    }),
    // `all` para observar cualquier método: el servicio usa POST, pero así una
    // regresión a PUT tampoco pasaría desapercibida.
    http.all('*/admin/users/:userId/roles', async ({ request }) => {
      assignRequests.push({
        method: request.method,
        url: request.url,
        body: await request.json(),
      });
      return HttpResponse.json({ success: true, message: 'ok', data: null });
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
          <MemoryRouter initialEntries={['/admin/usuarios']}>
            <UsersPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('UsersPage — gating de /admin/roles por privilegio y drawer abierto', () => {
  it('no pide /admin/roles al montar la página si falta roles.read', async () => {
    renderPage(usersOnly);

    await screen.findByText('Alice');
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(roleRequests).toBe(0);
  });

  it('no pide /admin/roles ni al abrir el drawer si falta roles.read', async () => {
    renderPage(usersOnly);

    fireEvent.click(await screen.findByText('Alice'));
    await screen.findByRole('dialog');
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(roleRequests).toBe(0);
  });

  it('no pide /admin/roles con el drawer cerrado y sí al abrirlo con roles.read', async () => {
    renderPage(usersAndRoles);

    await screen.findByText('Alice');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(roleRequests).toBe(0);

    fireEvent.click(screen.getByText('Alice'));
    await screen.findByRole('dialog');
    await waitFor(() => {
      expect(roleRequests).toBeGreaterThan(0);
    });
  });
});

describe('UserRolesDrawer — catálogo no disponible sin roles.read', () => {
  it('muestra los roles reales del usuario y bloquea Guardar sin enviar escrituras', async () => {
    renderPage(usersAssignOnly);

    fireEvent.click(await screen.findByText('Alice'));
    const dialog = await screen.findByRole('dialog');

    // Los badges salen de user.roles, no del catálogo no disponible.
    expect(within(dialog).getByText('viewer')).toBeInTheDocument();
    expect(within(dialog).queryByText('Sin roles asignados')).not.toBeInTheDocument();

    // Mensaje honesto en lugar del picker vacío.
    expect(
      within(dialog).getByText(/no tienes permiso para ver el catálogo de roles/i),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText('No hay roles en el sistema')).not.toBeInTheDocument();

    const saveButton = within(dialog).getByRole('button', { name: 'Guardar' });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(assignRequests).toHaveLength(0);
  });

  it('nunca envía un set de roles vacío desde el estado degradado', async () => {
    renderPage(usersAssignOnly);

    fireEvent.click(await screen.findByText('Alice'));
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }));
    await new Promise((resolve) => setTimeout(resolve, 30));

    const writes = assignRequests.filter((r) => r.url.includes('/admin/users/u1/roles'));
    expect(writes).toHaveLength(0);
    // El guard evita enviar un set que la UI no pudo mostrar; un envío vacío,
    // además, lo rechazaría el backend con 400 (@NotEmpty), no borraría roles.
    expect(
      writes.filter((r) => {
        const body = r.body as { roleIds?: unknown } | null;
        return Array.isArray(body?.roleIds) && body.roleIds.length === 0;
      }),
    ).toHaveLength(0);
  });
});

// El estado degradado de arriba nunca pide /admin/roles: la query está
// deshabilitada. Estos tests la habilitan con roles.read y fuerzan un fallo real
// del catálogo, el único camino por el que el componente llega a su estado de
// error (el 403, en cambio, redirige a nivel de cliente y no lo deja montado).
describe('UserRolesDrawer — fallo real de /admin/roles con roles.read', () => {
  it('con 500 muestra el error honesto, oculta el picker, deshabilita Guardar y no escribe', async () => {
    server.use(
      http.get('*/admin/roles', () => {
        roleRequests += 1;
        return HttpResponse.json(
          { success: false, message: 'Error interno', code: 'INTERNAL_ERROR' },
          { status: 500 },
        );
      }),
    );

    renderPage(usersRolesAssign);

    fireEvent.click(await screen.findByText('Alice'));
    const dialog = await screen.findByRole('dialog');

    // La query se habilitó con roles.read y se rechazó de verdad: cae el estado
    // de error, no el picker vacío (a diferencia del caso degradado, que nunca pide).
    expect(
      await within(dialog).findByText(
        'No se pudieron cargar los roles. No es posible asignarlos sin el catálogo.',
      ),
    ).toBeInTheDocument();
    expect(roleRequests).toBeGreaterThan(0);
    expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('No hay roles en el sistema')).not.toBeInTheDocument();

    const saveButton = within(dialog).getByRole('button', { name: 'Guardar' });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(assignRequests).toHaveLength(0);
  });

  it('con error de red también cae en el estado de error y no escribe', async () => {
    server.use(
      http.get('*/admin/roles', () => {
        roleRequests += 1;
        return HttpResponse.error();
      }),
    );

    renderPage(usersRolesAssign);

    fireEvent.click(await screen.findByText('Alice'));
    const dialog = await screen.findByRole('dialog');

    expect(
      await within(dialog).findByText(
        'No se pudieron cargar los roles. No es posible asignarlos sin el catálogo.',
      ),
    ).toBeInTheDocument();
    expect(roleRequests).toBeGreaterThan(0);

    const saveButton = within(dialog).getByRole('button', { name: 'Guardar' });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(assignRequests).toHaveLength(0);
  });

  it('con 403 redirige a /403 a nivel de cliente en vez de dejar el estado de error', async () => {
    // Un 403 en /admin/roles pasa por la rama de client.ts que llama a
    // onForbidden -> shouldRedirectToForbidden. Con un pathname distinto de /403
    // y de /login termina en `window.location.href = '/403'`. Se mockea
    // `location` para observar la navegación sin depender de la navegación no
    // implementada de jsdom.
    const originalLocation = window.location;
    const locationMock = { pathname: '/admin/usuarios', href: 'http://localhost/admin/usuarios' };
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: locationMock,
    });

    try {
      server.use(
        http.get('*/admin/roles', () =>
          HttpResponse.json(
            { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
            { status: 403 },
          ),
        ),
      );

      renderPage(usersRolesAssign);

      fireEvent.click(await screen.findByText('Alice'));

      await waitFor(() => expect(locationMock.href).toBe('/403'));
      expect(assignRequests).toHaveLength(0);
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
      });
    }
  });
});

describe('UserRolesDrawer — control positivo con catálogo cargado', () => {
  it('carga el picker, habilita Guardar y envía los roleIds seleccionados', async () => {
    renderPage(usersRolesAssign);

    fireEvent.click(await screen.findByText('Alice'));
    const dialog = await screen.findByRole('dialog');

    const viewerCheckbox = await within(dialog).findByRole('checkbox', { name: /viewer/i });
    expect(viewerCheckbox).toBeChecked();

    fireEvent.click(within(dialog).getByRole('checkbox', { name: /admin/i }));

    const saveButton = within(dialog).getByRole('button', { name: 'Guardar' });
    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);

    await waitFor(() => expect(assignRequests).toHaveLength(1));
    const body = assignRequests[0].body as { roleIds: string[] };
    expect(assignRequests[0].method).toBe('POST');
    expect([...body.roleIds].sort()).toEqual(['r1', 'r2']);
  });
});
