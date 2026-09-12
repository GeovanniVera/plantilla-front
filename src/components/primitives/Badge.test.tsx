import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge>Info</Badge>)
    const badge = screen.getByText('Info')
    expect(badge).toHaveClass('bg-accent-subtle', 'text-accent')
  })

  it('applies success variant classes', () => {
    render(<Badge variant="success">OK</Badge>)
    const badge = screen.getByText('OK')
    expect(badge).toHaveClass('bg-success-bg', 'text-success-strong')
  })

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Warn</Badge>)
    const badge = screen.getByText('Warn')
    expect(badge).toHaveClass('bg-warning-bg', 'text-warning-strong')
  })

  it('applies info variant classes', () => {
    render(<Badge variant="info">Info</Badge>)
    const badge = screen.getByText('Info')
    expect(badge).toHaveClass('bg-info-bg', 'text-info-strong')
  })

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge).toHaveClass('bg-danger-bg', 'text-danger-strong')
  })

  it('Badge.Icon renders icon', () => {
    render(
      <Badge>
        <Badge.Icon><span data-testid="icon">★</span></Badge.Icon>
        Featured
      </Badge>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })
})
