import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotFoundPage from './NotFoundPage';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderNotFoundPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = renderNotFoundPage();
    expect(container).toBeDefined();
  });

  it('shows the 404 image', () => {
    renderNotFoundPage();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/404.png');
  });

  it('navigates back on back button click', () => {
    renderNotFoundPage();
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates home on home button click', () => {
    renderNotFoundPage();
    fireEvent.click(screen.getByRole('button', { name: /ir al inicio/i }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
