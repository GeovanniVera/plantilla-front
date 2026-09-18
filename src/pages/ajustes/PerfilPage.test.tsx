import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import PerfilPage from './PerfilPage';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';
import type { User } from '../../lib/api/types/api-response';
import { ToastProvider } from '@components/feedback';
import { server } from '../../test/mocks/server';

const profileUser: User = {
  id: '1',
  email: 'usuario@test.com',
  name: 'Nombre Original',
  roles: ['viewer'],
  permissions: [],
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
    hasPrivilege: () => false,
    hasAnyPrivilege: () => false,
    hasRole: (role) => user.roles.includes(role),
    isVerified: () => user.isVerified,
  };
}

let lastFormData: FormData | null = null;

beforeEach(() => {
  lastFormData = null;
  server.use(
    http.put('*/auth/me', async ({ request }) => {
      lastFormData = await request.formData();
      return HttpResponse.json({ success: true, message: 'ok', data: profileUser });
    }),
  );
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue(profileUser)}>
          <MemoryRouter initialEntries={['/ajustes/perfil']}>
            <PerfilPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('PerfilPage — email no editable', () => {
  it('renderiza el email como solo lectura e indica que no se puede cambiar', () => {
    renderPage();

    const emailInput = screen.getByDisplayValue('usuario@test.com') as HTMLInputElement;

    expect(emailInput.readOnly).toBe(true);
    expect(screen.getByText(/el email no se puede cambiar/i)).toBeInTheDocument();
  });

  it('guarda nombre y foto sin enviar el campo email', async () => {
    renderPage();

    fireEvent.change(screen.getByDisplayValue('Nombre Original'), {
      target: { value: 'Nombre Nuevo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => expect(lastFormData).not.toBeNull());
    expect(lastFormData!.get('name')).toBe('Nombre Nuevo');
    expect(lastFormData!.get('email')).toBeNull();
  });

  it('un cambio de email no abre el diálogo de confirmación ni viaja en el payload', async () => {
    renderPage();

    fireEvent.change(screen.getByDisplayValue('usuario@test.com'), {
      target: { value: 'otro@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => expect(lastFormData).not.toBeNull());
    // No hay ruta de guardado específica de email: nada de diálogo "Cambiar email".
    expect(screen.queryByText(/cambiar email/i)).not.toBeInTheDocument();
    expect(lastFormData!.get('email')).toBeNull();
  });
});
