import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from './context';
import type { AuthContextValue, User } from './types';
import {
  GuestOnly,
  ProtectedRoute,
  RequirePrivilege,
  RequireRole,
  RequireUnverified,
} from './guards';

const admin: User = {
  id: '1',
  email: 'admin@test.com',
  name: 'Admin User',
  roles: ['admin'],
  permissions: ['users:read', 'settings:manage'],
  isVerified: true,
};

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  const user = overrides.user === undefined ? null : overrides.user;
  return {
    user,
    token: user ? 'token' : null,
    isAuthenticated: Boolean(user),
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasPrivilege: (privilege) => user?.permissions.includes(privilege) ?? false,
    hasAnyPrivilege: (privileges) =>
      privileges.some((privilege) => user?.permissions.includes(privilege)),
    hasRole: (role) => user?.roles.includes(role) ?? false,
    isVerified: () => user?.isVerified ?? false,
    ...overrides,
  };
}

function renderGuard(ui: ReactNode, value = authValue()) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/verify-email" element={<div>Verify Email Page</div>} />
          <Route path="/403" element={<div>Forbidden Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/sign-in" element={<div>Custom Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows the session loading state', () => {
    renderGuard(<ProtectedRoute>Protected Content</ProtectedRoute>, authValue({ isLoading: true }));
    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
  });

  it('redirects anonymous users to login', () => {
    renderGuard(<ProtectedRoute>Protected Content</ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('uses a custom anonymous redirect', () => {
    renderGuard(<ProtectedRoute redirectTo="/sign-in">Protected Content</ProtectedRoute>);
    expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
  });

  it('renders authenticated and verified users', () => {
    renderGuard(<ProtectedRoute>Protected Content</ProtectedRoute>, authValue({ user: admin }));
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unverified users to email verification', () => {
    renderGuard(
      <ProtectedRoute>Protected Content</ProtectedRoute>,
      authValue({ user: { ...admin, isVerified: false } }),
    );
    expect(screen.getByText('Verify Email Page')).toBeInTheDocument();
  });

  it('can allow an authenticated user without email verification', () => {
    renderGuard(
      <ProtectedRoute requireVerification={false}>Protected Content</ProtectedRoute>,
      authValue({ user: { ...admin, isVerified: false } }),
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('GuestOnly', () => {
  it('shows the session loading state', () => {
    renderGuard(<GuestOnly>Guest Content</GuestOnly>, authValue({ isLoading: true }));
    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
  });

  it('renders anonymous users', () => {
    renderGuard(<GuestOnly>Guest Content</GuestOnly>);
    expect(screen.getByText('Guest Content')).toBeInTheDocument();
  });

  it('redirects authenticated users', () => {
    renderGuard(
      <GuestOnly redirectTo="/dashboard">Guest Content</GuestOnly>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});

describe('RequirePrivilege', () => {
  it('redirects anonymous users to login', () => {
    renderGuard(<RequirePrivilege privilege="users:read">Privileged Content</RequirePrivilege>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders users with the exact privilege', () => {
    renderGuard(
      <RequirePrivilege privilege="users:read">Privileged Content</RequirePrivilege>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Privileged Content')).toBeInTheDocument();
  });

  it('accepts any matching alternative privilege', () => {
    renderGuard(
      <RequirePrivilege privilege="unused" anyOf={['reports:export', 'settings:manage']}>
        Privileged Content
      </RequirePrivilege>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Privileged Content')).toBeInTheDocument();
  });

  it('redirects users without a required privilege', () => {
    renderGuard(
      <RequirePrivilege privilege="reports:export">Privileged Content</RequirePrivilege>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });
});

describe('RequireRole', () => {
  it('redirects anonymous users to login', () => {
    renderGuard(<RequireRole role="admin">Admin Content</RequireRole>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders users with the required role', () => {
    renderGuard(<RequireRole role="admin">Admin Content</RequireRole>, authValue({ user: admin }));
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects users without the required role', () => {
    renderGuard(<RequireRole role="owner">Admin Content</RequireRole>, authValue({ user: admin }));
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });
});

describe('RequireUnverified', () => {
  it('shows the session loading state', () => {
    renderGuard(
      <RequireUnverified>Verification Content</RequireUnverified>,
      authValue({ isLoading: true }),
    );
    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
  });

  it('redirects anonymous users to login', () => {
    renderGuard(<RequireUnverified>Verification Content</RequireUnverified>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Verification Content')).not.toBeInTheDocument();
  });

  it('redirects verified authenticated users to the dashboard', () => {
    renderGuard(
      <RequireUnverified>Verification Content</RequireUnverified>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Verification Content')).not.toBeInTheDocument();
  });

  it('renders authenticated users without email verification', () => {
    renderGuard(
      <RequireUnverified>Verification Content</RequireUnverified>,
      authValue({ user: { ...admin, isVerified: false } }),
    );
    expect(screen.getByText('Verification Content')).toBeInTheDocument();
  });

  it('honors a custom verified redirect target', () => {
    renderGuard(
      <RequireUnverified redirectTo="/login">Verification Content</RequireUnverified>,
      authValue({ user: admin }),
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
