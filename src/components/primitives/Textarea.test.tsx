import { render, screen, fireEvent } from '@testing-library/react'
import Textarea from './Textarea'

describe('Textarea', () => {
  it('renders', () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('displays value', () => {
    render(<Textarea value="hello" readOnly />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls onChange with the string value', () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test content' } })
    expect(onChange).toHaveBeenCalledWith('test content')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Textarea disabled placeholder="Enter" />)
    expect(screen.getByPlaceholderText('Enter')).toBeDisabled()
  })

  it('is readOnly when readOnly prop is set', () => {
    render(<Textarea value="readonly" readOnly />)
    expect(screen.getByDisplayValue('readonly')).toHaveAttribute('readonly')
  })

  it('sets aria-invalid when validationState is invalid', () => {
    render(<Textarea validationState="invalid" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-invalid when aria-invalid prop is "true"', () => {
    render(<Textarea aria-invalid="true" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies rows attribute', () => {
    render(<Textarea rows={8} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
  })

  it('defaults to 4 rows', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4')
  })
})
