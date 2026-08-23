import { LuRows3, LuRows2, LuRows4 } from 'react-icons/lu'

export type Density = 'compact' | 'comfortable' | 'relaxed'

interface DensitySelectorProps {
    value: Density
    onChange: (density: Density) => void
}

const OPTIONS: { value: Density; icon: typeof LuRows3; label: string; px: string }[] = [
    { value: 'compact',   icon: LuRows3, label: 'Condensado',  px: '40px' },
    { value: 'comfortable', icon: LuRows2, label: 'Regular',    px: '48px' },
    { value: 'relaxed',   icon: LuRows4,  label: 'Relajado',    px: '56px' },
]

export function DensitySelector({ value, onChange }: DensitySelectorProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
        }}>
            {OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isActive = value === opt.value
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        title={`${opt.label} (${opt.px})`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isActive ? 'var(--accent)' : 'transparent',
                            color: isActive ? '#fff' : 'var(--text)',
                            cursor: 'pointer',
                            transition: 'background 0.12s, color 0.12s',
                            opacity: isActive ? 1 : 0.6,
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'var(--accent-bg)'
                                e.currentTarget.style.opacity = '1'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.opacity = '0.6'
                            }
                        }}
                    >
                        <Icon size={14} />
                    </button>
                )
            })}
        </div>
    )
}
