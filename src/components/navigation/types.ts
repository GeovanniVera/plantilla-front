import type { ReactNode } from 'react';

// ─── Tabs ─────────────────────────────────────────────────
export type TabsVariant = 'underline' | 'pills' | 'enclosed';

export interface TabsProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Called on value change */
  onChange?: (value: string) => void;
  variant?: TabsVariant;
  children: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TabsPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// ─── Breadcrumb ───────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: '/' | '>' | '›' | ReactNode;
  className?: string;
}
