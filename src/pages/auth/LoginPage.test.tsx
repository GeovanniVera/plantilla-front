import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../auth';
import LoginPage from './LoginPage';

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = renderLoginPage();
    expect(container).toBeDefined();
  });

  it('contains a form element', () => {
    const { container } = renderLoginPage();
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
