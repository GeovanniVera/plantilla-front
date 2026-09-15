import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import App from './App';
import { authStorage } from './lib/auth/token-store';
import './lib/i18n/config';

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
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(await screen.findByPlaceholderText('tu@email.com'), {
      target: { value: 'flow@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('heading', { name: 'Email enviado' })).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Enviamos un código de 6 dígitos a flow@test.com',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    const otpInputs = screen.getAllByRole('textbox');
    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      fireEvent.change(otpInputs[index], { target: { value: digit } });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeInTheDocument();
    });
    expect(screen.getByText('Ingresa tu nueva contraseña para flow@test.com')).toBeInTheDocument();
  });
});
