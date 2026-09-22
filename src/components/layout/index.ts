/**
 * Public surface of the layout family.
 *
 * FormLayout's prop contract (FormLayoutProps) lives in ../forms/types.ts
 * alongside every other form-related declaration and is re-exported here so
 * consumers wrapping <FormLayout> can name its props without reaching into
 * another family. No declarations were moved.
 *
 * This barrel only imports leaf modules — never another family barrel — to
 * keep the cross-family graph acyclic.
 */

// ─── Card ────────────────────────────────────────────
export { default as Card } from './Card';
export type { CardVariant } from './Card';

// ─── ExpandableCard ──────────────────────────────────
export { default as ExpandableCard } from './ExpandableCard';
export type { ExpandableCardProps } from './ExpandableCard';

// ─── StatCard ────────────────────────────────────────
export { StatCard, StatCardGroup } from './StatCard';
export type { StatCardProps, StatCardGroupProps } from './StatCard';

// ─── FormLayout ──────────────────────────────────────
export { default as FormLayout } from './FormLayout';
export type { FormLayoutProps } from '../forms/types';
