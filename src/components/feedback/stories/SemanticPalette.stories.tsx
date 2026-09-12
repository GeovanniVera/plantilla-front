import Badge from '../../primitives/Badge';
import { StatusDot } from '../../primitives/StatusDot';
import { Toast } from '../../feedback/Toast';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Feedback/Semantic Palette',
  tags: ['autodocs'],
};
export default meta;

function makeToast(variant: 'success' | 'error' | 'warning' | 'info', message: string) {
  return { id: variant, variant, message, createdAt: Date.now() };
}

/**
 * Cross-component semantic consistency check: the same four statuses must
 * read as the same family across Badge, StatusDot and Toast. Colors come
 * from the shared accessible token layer (phase 8D.3) — this story is a
 * visual regression surface, not an API.
 */
export const StatusComparison: StoryObj = {
  render: () => {
    const statuses: {
      name: string;
      badgeVariant: 'success' | 'warning' | 'info';
      dotColor: 'green' | 'yellow' | 'blue';
      toast: ReturnType<typeof makeToast>;
    }[] = [
      {
        name: 'Success',
        badgeVariant: 'success',
        dotColor: 'green',
        toast: makeToast('success', 'Operación completada'),
      },
      {
        name: 'Warning',
        badgeVariant: 'warning',
        dotColor: 'yellow',
        toast: makeToast('warning', 'Revisa tu configuración'),
      },
      {
        name: 'Info',
        badgeVariant: 'info',
        dotColor: 'blue',
        toast: makeToast('info', 'Novedades disponibles'),
      },
    ];
    const dangerToast = makeToast('error', 'No se pudo completar');

    return (
      <div className="flex flex-col gap-6 p-6" style={{ background: 'var(--bg)' }}>
        {/* Danger has no Badge variant — shown via Toast only */}
        <div className="flex items-center gap-4">
          <span className="w-16 text-xs">danger</span>
          <Toast item={dangerToast} defaultDuration={99999} onDismiss={() => {}} />
        </div>
        {statuses.map((s) => (
          <div key={s.name} className="flex items-center gap-4">
            <span className="w-16 text-xs">{s.name}</span>
            <Badge variant={s.badgeVariant}>{s.name}</Badge>
            <StatusDot color={s.dotColor} label={s.name} />
            <Toast item={s.toast} defaultDuration={99999} onDismiss={() => {}} />
          </div>
        ))}
      </div>
    );
  },
};

/** Long labels inside badges keep the nowrap contract. */
export const BadgeLongLabel: StoryObj = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Badge>Etiqueta</Badge>
      <Badge variant="success">
        <Badge.Icon>✓</Badge.Icon>
        Etiqueta de longitud considerable para verificar el comportamiento
      </Badge>
    </div>
  ),
};
