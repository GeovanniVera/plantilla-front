import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServerErrorPage from './ServerErrorPage';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderServerErrorPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ServerErrorPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ServerErrorPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = renderServerErrorPage();
    expect(container).toBeDefined();
  });

  it('shows the 500 image', () => {
    renderServerErrorPage();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/500.png');
  });

  it('navigates back on back button click', () => {
    renderServerErrorPage();
    fireEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates home on home button click', () => {
    renderServerErrorPage();
    fireEvent.click(screen.getByRole('button', { name: /ir al inicio/i }));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });
});
