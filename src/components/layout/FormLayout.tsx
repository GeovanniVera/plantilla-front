import type { FormLayoutProps } from '@components/forms/types';

const COLUMN_CLASSES: Record<FormLayoutProps['columns'] & number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export default function FormLayout({
  columns = 1,
  gap = '20px',
  children,
  className,
}: FormLayoutProps) {
  return (
    <div
      className={`grid ${COLUMN_CLASSES[columns]} max-[640px]:grid-cols-1 ${className ?? ''}`}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
