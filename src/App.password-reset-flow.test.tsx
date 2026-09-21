import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { authStorage } from './lib/auth/token-store';
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

describe('password reset router flow', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage());
    authStorage.clearAll();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves recovery state across all three routes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/forgot-password']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByPlaceholderText('tu@email.com'), {
      target: { value: 'flow@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('heading', { name: 'Email enviado' })).toBeInTheDocument();
    expect(
      await screen.findByText('Revisa tu bandeja de entrada y ingresa el código de 6 dígitos.'),
    ).toBeInTheDocument();

    // La página navega a /verify-otp tras un setTimeout de 2s
    let otpInputs: HTMLElement[] = [];
    await waitFor(
      () => {
        otpInputs = screen.getAllByRole('textbox');
        expect(otpInputs).toHaveLength(6);
      },
      { timeout: 4000 },
    );
    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      fireEvent.change(otpInputs[index], { target: { value: digit } });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeInTheDocument();
    });
    expect(screen.getByText('Ingresa tu nueva contraseña para flow@test.com')).toBeInTheDocument();
  });
});
