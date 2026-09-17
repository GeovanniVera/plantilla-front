import type { ComponentPropsWithoutRef } from 'react';

/**
 * Merge class names, filtering out falsy values.
 */
export function classes(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}

/**
 * Check if aria-invalid is truthy (true or 'true').
 */
export function isAriaInvalid(value: ComponentPropsWithoutRef<'input'>['aria-invalid']): boolean {
  return value === true || value === 'true';
}

/**
 * Formatea un nombre completo en formato corto para UI:
 * "Geovanni Benjamin Vera Balcazar" → "Geovanni V."
 * "Juan Pérez" → "Juan P."
 * "María" → "María"
 */
export function formatDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return name;
  const firstName = parts[0];
  if (parts.length === 1) return firstName;
  const lastInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
