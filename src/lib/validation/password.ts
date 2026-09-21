/**
 * Política de contraseñas compartida (frontend).
 *
 * Fuente única de verdad para la validación de contraseñas en los flujos donde
 * la contraseña se CREA o CAMBIA (registro y restablecimiento). El login NO la
 * usa. Los predicados replican EXACTAMENTE la política del backend
 * (`PasswordPolicyValidator`):
 *
 * - Longitud entre 8 y 128 caracteres.
 * - Al menos una mayúscula: /[A-Z]/
 * - Al menos una minúscula: /[a-z]/
 * - Al menos un símbolo: /[^a-zA-Z0-9 \t\n\r\f\v]/
 *
 * El espacio en blanco se excluye del símbolo a propósito para que el usuario
 * siempre pueda VER el símbolo que escribió. En cambio, letras no ASCII como
 * `ñ` o `á` SÍ cuentan como símbolo, y los emojis también (igual que backend).
 *
 * IMPORTANTE — paridad con Java: la clase de espacios en blanco se escribe de
 * forma ASCII EXPLÍCITA (` \t\n\r\f\v`) en lugar de `\s`, porque `\s` NO es
 * equivalente entre lenguajes: el `\s` de Java es solo ASCII, mientras que el
 * `\s` de JavaScript incluye todos los espacios Unicode (NBSP U+00A0, em
 * spaces, line separators, etc.). Con `\s`, un NBSP contaría como símbolo en
 * el backend pero no en el frontend, desincronizando ambas validaciones. La
 * clase explícita replica exactamente la semántica de Java.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Clave i18n del mensaje de error completo (espeja el mensaje del backend). */
export const PASSWORD_POLICY_ERROR_KEY = 'auth.passwordPolicy.error';

/** Al menos una letra mayúscula ASCII. */
const UPPERCASE_REGEX = /[A-Z]/;

/** Al menos una letra minúscula ASCII. */
const LOWERCASE_REGEX = /[a-z]/;

/** Al menos un símbolo: ni letra ASCII, ni dígito, ni espacio en blanco ASCII. */
const SYMBOL_REGEX = /[^a-zA-Z0-9 \t\n\r\f\v]/;

export type PasswordRequirementId = 'minLength' | 'uppercase' | 'lowercase' | 'symbol';

export interface PasswordRequirement {
  id: PasswordRequirementId;
  /** Clave i18n de la etiqueta que se muestra en el checklist. */
  translationKey: string;
  /** Predicado que evalúa el valor actual contra el requisito. */
  test: (value: string) => boolean;
}

/**
 * Requisitos mostrados en el checklist de la UI. El máximo de longitud se
 * valida en `isPasswordValid` pero no se lista como fila (no es accionable).
 */
export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: 'minLength',
    translationKey: 'auth.passwordPolicy.minLength',
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    translationKey: 'auth.passwordPolicy.uppercase',
    test: (value) => UPPERCASE_REGEX.test(value),
  },
  {
    id: 'lowercase',
    translationKey: 'auth.passwordPolicy.lowercase',
    test: (value) => LOWERCASE_REGEX.test(value),
  },
  {
    id: 'symbol',
    translationKey: 'auth.passwordPolicy.symbol',
    test: (value) => SYMBOL_REGEX.test(value),
  },
];

/**
 * Indica si la contraseña cumple la política completa (longitud + requisitos).
 */
export function isPasswordValid(value: string): boolean {
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return false;
  }
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value));
}

/**
 * Valida una contraseña y devuelve la clave i18n del mensaje de error, o
 * `null` si es válida. La clave se traduce con `t(...)` en la página.
 */
export function validatePassword(value: string): string | null {
  return isPasswordValid(value) ? null : PASSWORD_POLICY_ERROR_KEY;
}
