import { render, screen, fireEvent } from '@testing-library/react'
import Radio, { RadioGroup } from './Radio'

describe('Radio', () => {
  it('renders unchecked by default', () => {
    render(<Radio name="test" value="a" checked={false} onChange={() => {}} />)
    expect(screen.getByRole('radio')).not.toBeChecked()
  })

  it('selects on click', () => {
    const onChange = vi.fn()
    render(<Radio name="test" value="a" checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio'))
    expect(onChange).toHaveBeenCalled()
  })

  it('renders checked when checked prop is true', () => {
    render(<Radio name="test" value="a" checked onChange={() => {}} />)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Radio name="test" value="a" checked disabled onChange={() => {}} />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('displays label', () => {
    render(<Radio name="test" value="a" checked={false} onChange={() => {}} label="Option A" />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('has correct name attribute', () => {
    render(<Radio name="group1" value="a" checked onChange={() => {}} />)
    expect(screen.getByRole('radio')).toHaveAttribute('name', 'group1')
  })
})

describe('RadioGroup', () => {
  const options = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ]

  it('renders all options', () => {
    render(<RadioGroup value="" onChange={() => {}} options={options} name="size" />)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('selects one option via RadioGroup', () => {
    const onChange = vi.fn()
    render(<RadioGroup value="medium" onChange={onChange} options={options} name="size" />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toBeChecked()
    expect(radios[1]).toBeChecked()
    expect(radios[2]).not.toBeChecked()
  })

  it('calls onChange with the correct value', () => {
    const onChange = vi.fn()
    render(<RadioGroup value="" onChange={onChange} options={options} name="size" />)
    fireEvent.click(screen.getByText('Large'))
    expect(onChange).toHaveBeenCalledWith('large')
  })

  it('has radiogroup role', () => {
    render(<RadioGroup value="" onChange={() => {}} options={options} name="size" />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})
