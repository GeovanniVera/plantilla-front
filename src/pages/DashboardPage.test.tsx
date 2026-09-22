import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './DashboardPage';
import { AuthContext } from '../auth/context';
import type { AuthContextValue } from '../auth/types';
import type { User } from '../lib/api/types/api-response';

// La sección "Acciones rápidas" exige users.read, roles.read o permissions.read.
// Cada usuario de prueba aísla un subconjunto para probar el filtrado por
// privilegio (y no un todo-o-nada).
function makeUser(permissions: string[]): User {
  return {
    id: '1',
    email: 'dashboard@test.com',
    name: 'Dashboard User',
    roles: ['viewer'],
    permissions,
    isVerified: true,
  };
}

const noPrivileges = makeUser([]);
const rolesOnly = makeUser(['roles.read']);
const usersAndPermissions = makeUser(['users.read', 'permissions.read']);

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

function renderPage(user: User) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue(user)}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

// El encabezado de la sección distingue "Acciones rápidas" de los títulos de
// cada tarjeta; se consulta por rol de encabezado para no depender del tag.
function quickActionsHeading() {
  return screen.queryByRole('heading', { name: /acciones rápidas/i });
}

describe('DashboardPage — visibilidad de "Acciones rápidas" por privilegio', () => {
  it('sin ningún privilegio no renderiza el encabezado ni ninguna acción', async () => {
    renderPage(noPrivileges);

    // La página sí monta: se espera el saludo antes de comprobar las ausencias.
    await screen.findByRole('heading', { name: /bienvenido, dashboard user/i });

    expect(quickActionsHeading()).not.toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
    expect(screen.queryByText('Permisos')).not.toBeInTheDocument();
  });

  it('con users.read y permissions.read muestra el encabezado y solo esas acciones', async () => {
    renderPage(usersAndPermissions);

    expect(await screen.findByRole('heading', { name: /acciones rápidas/i })).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Permisos')).toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
  });

  it('con solo roles.read muestra la tarjeta Roles y ninguna otra', async () => {
    renderPage(rolesOnly);

    expect(await screen.findByRole('heading', { name: /acciones rápidas/i })).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Permisos')).not.toBeInTheDocument();
  });
});
