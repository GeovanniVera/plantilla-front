import { render, screen, fireEvent } from '@testing-library/react';
import Textarea from './Textarea';

describe('Textarea', () => {
  it('renders', () => {
    render(<Textarea value="" onChange={() => {}} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('displays value', () => {
    render(<Textarea value="hello" onChange={() => {}} readOnly />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('calls onChange with the string value', () => {
    const onChange = vi.fn();
    render(<Textarea value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test content' } });
    expect(onChange).toHaveBeenCalledWith('test content');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea value="" onChange={() => {}} disabled placeholder="Enter" />);
    expect(screen.getByPlaceholderText('Enter')).toBeDisabled();
  });

  it('is readOnly when readOnly prop is set', () => {
    render(<Textarea value="readonly" onChange={() => {}} readOnly />);
    expect(screen.getByDisplayValue('readonly')).toHaveAttribute('readonly');
  });

  it('sets aria-invalid when validationState is invalid', () => {
    render(<Textarea value="" onChange={() => {}} validationState="invalid" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid when aria-invalid prop is "true"', () => {
    render(<Textarea value="" onChange={() => {}} aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies rows attribute', () => {
    render(<Textarea value="" onChange={() => {}} rows={8} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
  });

  it('defaults to 4 rows', () => {
    render(<Textarea value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });
});
