import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkbox from './Checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('sets indeterminate DOM property', () => {
    render(<Checkbox indeterminate onChange={() => {}} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveProperty('indeterminate', true)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Checkbox disabled onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('displays label', () => {
    render(<Checkbox label="Accept terms" onChange={() => {}} />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('onChange receives boolean', () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox disabled onChange={onChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
