import type { ComponentPropsWithoutRef } from 'react'

/**
 * Merge class names, filtering out falsy values.
 */
export function classes(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Check if aria-invalid is truthy (true or 'true').
 */
export function isAriaInvalid(
  value: ComponentPropsWithoutRef<'input'>['aria-invalid'],
): boolean {
  return value === true || value === 'true'
}
