import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ForgotPasswordPage from './ForgotPasswordPage'
import { ForgotPasswordProvider } from '../../auth/ForgotPasswordContext'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import '../../lib/i18n/config'

const navigateMock = vi.fn()
vi.mock('react-router', async () => ({
  ...await vi.importActual('react-router'),
  useNavigate: () => navigateMock,
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

function renderForgotPasswordPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ForgotPasswordProvider>
          <ForgotPasswordPage />
        </ForgotPasswordProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    queryClient.clear()
    navigateMock.mockReset()
  })

  it('renders forgot password form', () => {
    renderForgotPasswordPage()
    expect(screen.getByText('Recuperar contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
  })

  it('sends forgot password email successfully', async () => {
    renderForgotPasswordPage()

    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))

    await waitFor(() => {
      expect(screen.getByText('Email enviado')).toBeInTheDocument()
    })
  })

  it('shows error on network failure', async () => {
    server.use(
      http.post('*/auth/forgot-password', () => {
        return HttpResponse.error()
      }),
    )

    renderForgotPasswordPage()

    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))

    await waitFor(() => {
      expect(screen.getByText(/Error de conexión/)).toBeInTheDocument()
    })
  })
})
