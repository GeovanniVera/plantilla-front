import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@components/feedback';
import { RoleDrawer } from './RoleDrawer';
import { AuthContext } from '../../../auth/context';
import type { AuthContextValue } from '../../../auth/types';
import type { User } from '../../../lib/api/types/api-response';
import type { Role } from '../services/role.service';

// `roles.write` enables the editable form; `permissions.read` is intentionally
// absent so the permissions query stays disabled and this test never hits the
// network.
const editor: User = {
  id: '1',
  email: 'editor@test.com',
  name: 'Role Editor',
  roles: ['admin'],
  permissions: ['roles.read', 'roles.write'],
  isVerified: true,
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
    hasAnyPrivilege: (privileges) => privileges.some((p) => user.permissions.includes(p)),
    hasRole: (role) => user.roles.includes(role),
    isVerified: () => user.isVerified,
  };
}

const baseRole: Role = { id: 'r1', name: 'viewer', description: 'Rol base', permissions: [] };

function renderDrawer(role: Role | null, onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const tree = (nextRole: Role | null) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue(editor)}>
          <RoleDrawer isOpen onClose={onClose} role={nextRole} />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  );

  const view = render(tree(role));
  return { rerenderWith: (nextRole: Role | null) => view.rerender(tree(nextRole)) };
}

describe('RoleDrawer — form state', () => {
  it('names the dialog from the header title', () => {
    renderDrawer(baseRole);

    expect(screen.getByRole('dialog', { name: 'Detalle del rol' })).toBeInTheDocument();
  });

  it('seeds the form from the opened role', () => {
    renderDrawer(baseRole);

    expect(screen.getByLabelText('Nombre')).toHaveValue('viewer');
    expect(screen.getByLabelText('Descripción')).toHaveValue('Rol base');
  });

  it('keeps in-progress edits when the same role is refetched with a new object identity', () => {
    const { rerenderWith } = renderDrawer(baseRole);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'editado' } });
    expect(screen.getByLabelText('Nombre')).toHaveValue('editado');

    // Same id, brand-new object: exactly what a react-query refetch returns.
    rerenderWith({ ...baseRole, description: 'otra descripción' });

    expect(screen.getByLabelText('Nombre')).toHaveValue('editado');
  });

  it('resets the form when a genuinely different role is opened', () => {
    const { rerenderWith } = renderDrawer(baseRole);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'editado' } });

    rerenderWith({ id: 'r2', name: 'editor', description: 'Otro rol', permissions: [] });

    expect(screen.getByLabelText('Nombre')).toHaveValue('editor');
  });

  it('starts empty in create mode', () => {
    renderDrawer(null);

    expect(screen.getByLabelText('Nombre')).toHaveValue('');
    expect(screen.getByLabelText('Descripción')).toHaveValue('');
  });
});
