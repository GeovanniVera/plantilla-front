import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TermsPage from './TermsPage';
import '../../lib/i18n/config';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderTermsPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TermsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderTermsPage();
    expect(container).toBeDefined();
  });

  it('shows the page title', () => {
    renderTermsPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Términos y Condiciones' }),
    ).toBeInTheDocument();
  });

  it('renders all 10 sections', () => {
    renderTermsPage();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
    expect(
      screen.getByRole('heading', { name: /aceptación de los términos/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /uso de la aplicación/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cuenta de usuario/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /propiedad intelectual/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /limitación de responsabilidad/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /privacidad/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /modificaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /terminación/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /legislación aplicable/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument();
  });

  it('has a back link to register', () => {
    renderTermsPage();
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toHaveAttribute('href', '/register');
  });

  it('shows the intro card', () => {
    renderTermsPage();
    expect(screen.getByText(/estos términos y condiciones rigen/i)).toBeInTheDocument();
  });

  it('shows the footer confirmation', () => {
    renderTermsPage();
    expect(screen.getByText(/ha leído y aceptado/i)).toBeInTheDocument();
  });
});
