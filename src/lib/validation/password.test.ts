import { describe, it, expect } from 'vitest';
import {
  isPasswordValid,
  validatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR_KEY,
  PASSWORD_REQUIREMENTS,
} from './password';

describe('validatePassword', () => {
  it('accepts a full valid password', () => {
    expect(validatePassword('Password1!')).toBeNull();
  });

  it('accepts a non-ASCII letter as symbol (ñ counts)', () => {
    // "Contraseña1": la 'ñ' no es letra ASCII ni dígito ni espacio, cuenta
    // como símbolo. Intencional, espeja el backend.
    expect(validatePassword('Contraseña1')).toBeNull();
  });

  it('rejects a password without uppercase', () => {
    expect(validatePassword('password1!')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('rejects a password without lowercase', () => {
    expect(validatePassword('PASSWORD1!')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('rejects a password without symbol', () => {
    expect(validatePassword('Password1')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('rejects a password whose only non-alphanumeric is a space', () => {
    // El espacio NO cuenta como símbolo.
    expect(validatePassword('Pass wo1rd')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('rejects a password whose only non-alphanumeric is an ASCII tab or newline', () => {
    // La clase de espacios ASCII explícita incluye tab, newline, form feed, etc.
    expect(validatePassword('Pass\two1rd')).toBe(PASSWORD_POLICY_ERROR_KEY);
    expect(validatePassword('Pass\nwo1rd')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('accepts a Unicode space as symbol, matching the backend', () => {
    // PARIDAD CON JAVA: el `\s` de Java es solo ASCII, así que NBSP (U+00A0),
    // line separator (U+2028) y em space (U+2003) SÍ cuentan como símbolo en el
    // backend. El frontend usa `[^a-zA-Z0-9 \t\n\r\f\v]` para replicarlo.
    // Si este test cambia, el backend debe cambiar junto con él.
    expect(validatePassword('Pass\u00A0word1')).toBeNull();
    expect(validatePassword('Pass\u2028word1')).toBeNull();
    expect(validatePassword('Pass\u2003word1')).toBeNull();
  });

  it('rejects a password that is too short', () => {
    expect(validatePassword('Pass1!')).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('rejects a password that is too long', () => {
    const tooLong = 'Aa1!'.repeat(32) + 'a'; // 129 caracteres
    expect(tooLong.length).toBe(PASSWORD_MAX_LENGTH + 1);
    expect(validatePassword(tooLong)).toBe(PASSWORD_POLICY_ERROR_KEY);
  });

  it('accepts a password exactly at the max length', () => {
    const maxLength = 'Aa1!'.repeat(32); // 128 caracteres
    expect(maxLength.length).toBe(PASSWORD_MAX_LENGTH);
    expect(validatePassword(maxLength)).toBeNull();
  });
});

describe('isPasswordValid', () => {
  it('is consistent with validatePassword', () => {
    expect(isPasswordValid('Password1!')).toBe(true);
    expect(isPasswordValid('weak')).toBe(false);
  });
});

describe('PASSWORD_REQUIREMENTS', () => {
  it('exposes the length constants', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(PASSWORD_MAX_LENGTH).toBe(128);
  });

  it('has one requirement per rule with unique ids', () => {
    const ids = PASSWORD_REQUIREMENTS.map((requirement) => requirement.id);
    expect(ids).toEqual(['minLength', 'uppercase', 'lowercase', 'symbol']);
  });

  it('evaluates each requirement independently', () => {
    const evaluate = (value: string) =>
      Object.fromEntries(PASSWORD_REQUIREMENTS.map((r) => [r.id, r.test(value)]));

    expect(evaluate('Password1')).toEqual({
      minLength: true,
      uppercase: true,
      lowercase: true,
      symbol: false,
    });
    expect(evaluate('password1!')).toEqual({
      minLength: true,
      uppercase: false,
      lowercase: true,
      symbol: true,
    });
    expect(evaluate('PASSWORD1!')).toEqual({
      minLength: true,
      uppercase: true,
      lowercase: false,
      symbol: true,
    });
    expect(evaluate('Pass1')).toEqual({
      minLength: false,
      uppercase: true,
      lowercase: true,
      symbol: false,
    });
  });
});
