import { LuRows3, LuRows2, LuRows4 } from 'react-icons/lu';

export type Density = 'compact' | 'comfortable' | 'relaxed';

interface DensitySelectorProps {
  value: Density;
  onChange: (density: Density) => void;
}

const OPTIONS: { value: Density; icon: typeof LuRows3; label: string; px: string }[] = [
  { value: 'compact', icon: LuRows3, label: 'Condensado', px: '40px' },
  { value: 'comfortable', icon: LuRows2, label: 'Regular', px: '48px' },
  { value: 'relaxed', icon: LuRows4, label: 'Relajado', px: '56px' },
];

/* Active/hover resolved as single effective sets per state — replaces
 * the legacy JS mouseenter/mouseleave handlers. */
const GROUP_CLASSES =
  'flex items-center gap-0.5 p-0.5 rounded-md border border-border-base bg-surface';

function buttonClasses(isActive: boolean) {
  return [
    'flex items-center justify-center size-7 rounded-sm border-none cursor-pointer transition-colors duration-150',
    isActive
      ? 'bg-accent text-white opacity-100'
      : 'bg-transparent text-foreground opacity-60 hover:bg-accent-subtle hover:opacity-100',
  ].join(' ');
}

export function DensitySelector({ value, onChange }: DensitySelectorProps) {
  return (
    <div className={GROUP_CLASSES}>
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={`${opt.label} (${opt.px})`}
            className={buttonClasses(isActive)}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
