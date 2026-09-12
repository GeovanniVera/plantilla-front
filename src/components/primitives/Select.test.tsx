import { render, screen, fireEvent } from '@testing-library/react'
import Select from './Select'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('Select', () => {
  it('renders options', () => {
    render(<Select options={options} value="" onChange={() => {}} />)
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn()
    render(<Select options={options} value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'banana' } })
    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Select options={options} value="" onChange={() => {}} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('shows placeholder when value is empty', () => {
    render(<Select options={options} value="" onChange={() => {}} placeholder="Pick a fruit" />)
    expect(screen.getByText('Pick a fruit')).toBeInTheDocument()
  })

  it('has data-placeholder attribute when showing placeholder', () => {
    render(<Select options={options} value="" onChange={() => {}} placeholder="Pick a fruit" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('data-placeholder')
  })

  it('sets aria-invalid when validationState is invalid', () => {
    render(<Select options={options} value="" onChange={() => {}} validationState="invalid" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-invalid when aria-invalid prop is "true"', () => {
    render(<Select options={options} value="" onChange={() => {}} aria-invalid="true" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays selected value', () => {
    render(<Select options={options} value="cherry" onChange={() => {}} />)
    expect(screen.getByRole('combobox')).toHaveValue('cherry')
  })
})
