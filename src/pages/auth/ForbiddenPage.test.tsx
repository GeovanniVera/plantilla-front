import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForbiddenPage from './ForbiddenPage';
import { AuthProvider } from '../../auth';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderForbiddenPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <ForbiddenPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ForbiddenPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = renderForbiddenPage();
    expect(container).toBeDefined();
  });

  it('shows the 403 image', () => {
    renderForbiddenPage();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/403.png');
  });

  it('navigates back on back button click', () => {
    renderForbiddenPage();
    const buttons = screen.getAllByRole('button');
    // The back button is the first one
    fireEvent.click(buttons[0]);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates home on home button click', () => {
    renderForbiddenPage();
    fireEvent.click(screen.getByRole('button', { name: /ir al inicio/i }));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });
});
