import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordRequirements from './PasswordRequirements';
import '../../lib/i18n/config';

describe('PasswordRequirements', () => {
  it('renders every policy requirement', () => {
    render(<PasswordRequirements value="" />);

    expect(screen.getByText('La contraseña debe:')).toBeInTheDocument();
    expect(screen.getByTestId('password-requirement-minLength')).toBeInTheDocument();
    expect(screen.getByTestId('password-requirement-uppercase')).toBeInTheDocument();
    expect(screen.getByTestId('password-requirement-lowercase')).toBeInTheDocument();
    expect(screen.getByTestId('password-requirement-symbol')).toBeInTheDocument();
  });

  it('marks each requirement as passed or failed from the value', () => {
    render(<PasswordRequirements value="Password1" />);

    expect(screen.getByTestId('password-requirement-minLength')).toHaveAttribute(
      'data-passed',
      'true',
    );
    expect(screen.getByTestId('password-requirement-uppercase')).toHaveAttribute(
      'data-passed',
      'true',
    );
    expect(screen.getByTestId('password-requirement-lowercase')).toHaveAttribute(
      'data-passed',
      'true',
    );
    // "Password1" no tiene símbolo.
    expect(screen.getByTestId('password-requirement-symbol')).toHaveAttribute(
      'data-passed',
      'false',
    );
  });

  it('does not count a space as a symbol', () => {
    render(<PasswordRequirements value="Pass wo1rd" />);

    expect(screen.getByTestId('password-requirement-symbol')).toHaveAttribute(
      'data-passed',
      'false',
    );
  });
});
