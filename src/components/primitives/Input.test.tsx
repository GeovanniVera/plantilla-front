import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('renders as standalone input', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('displays value', () => {
    render(<Input value="hello" readOnly />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls onChange with the string value', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled placeholder="Enter" />)
    expect(screen.getByPlaceholderText('Enter')).toBeDisabled()
  })

  it('is readOnly when readOnly prop is set', () => {
    render(<Input value="readonly" readOnly />)
    expect(screen.getByDisplayValue('readonly')).toHaveAttribute('readonly')
  })

  it('propagates aria-invalid when validationState is invalid', () => {
    render(<Input validationState="invalid" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-invalid to true when aria-invalid prop is true', () => {
    render(<Input aria-invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-invalid to true when aria-invalid is "true"', () => {
    render(<Input aria-invalid="true" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders with size sm', () => {
    const { container } = render(<Input size="sm" />)
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })

  it('renders with size md (default)', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })

  describe('shorthand with adornments', () => {
    it('renders with startAdornment', () => {
      render(<Input startAdornment={<span>$</span>} />)
      expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('renders with endAdornment', () => {
      render(<Input endAdornment={<span>kg</span>} />)
      expect(screen.getByText('kg')).toBeInTheDocument()
    })

    it('renders password toggle button for password type', () => {
      render(<Input type="password" showPasswordToggle />)
      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
    })

    it('toggles password visibility on click', async () => {
      const user = userEvent.setup()
      render(<Input type="password" showPasswordToggle />)
      const toggle = screen.getByRole('button', { name: 'Show password' })
      await user.click(toggle)
      expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
    })
  })
})
