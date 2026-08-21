import { useTheme } from './useTheme'
import { contrastRatio, formatRatio, wcagLevel, type WcagLevel } from './contrast'
import styles from './ContrastChecker.module.css'

// Combinaciones a evaluar: [foreground, background, label]
// Usamos las CSS variables que el ThemeProvider aplica en vivo
const combinations = [
    { fg: 'var(--text)',    bg: 'var(--bg)',      label: 'Texto sobre Fondo' },
    { fg: 'var(--text)',    bg: 'var(--code-bg)',  label: 'Texto sobre Superficie' },
    { fg: 'var(--text-h)',  bg: 'var(--bg)',      label: 'Texto (títulos) sobre Fondo' },
    { fg: 'var(--bg)',      bg: 'var(--primary)',  label: 'Fondo sobre Primario' },
    { fg: 'var(--secondary)', bg: 'var(--code-bg)', label: 'Primario sobre Superficie' },
    { fg: 'var(--bg)',      bg: 'var(--accent)',   label: 'Fondo sobre Acento' },
]

function LevelBadge({ level }: { level: WcagLevel }) {
    const config = {
        AAA: { text: 'Cumple AAA', className: styles.levelAaa },
        AA:  { text: 'Cumple AA',  className: styles.levelAa },
        fail:{ text: 'No cumple',  className: styles.levelFail },
    }[level]

    return <span className={`${styles.level} ${config.className}`}>{config.text}</span>
}

export default function ContrastChecker() {
    const { tokens } = useTheme()

    // Resolvemos los valores reales de las CSS variables para calcular
    const resolved = [
        { fg: tokens.text,    bg: tokens.background, label: 'Texto sobre Fondo' },
        { fg: tokens.text,    bg: tokens.surface,    label: 'Texto sobre Superficie' },
        { fg: tokens['text-h'], bg: tokens.background, label: 'Texto (títulos) sobre Fondo' },
        { fg: tokens.background, bg: tokens.primary,  label: 'Fondo sobre Primario' },
        { fg: tokens.secondary, bg: tokens.surface,   label: 'Primario sobre Superficie' },
        { fg: tokens.background, bg: tokens.accent,   label: 'Fondo sobre Acento' },
    ]

    return (
        <div className={styles.panel}>
            <h3 className={styles.heading}>Validador de contraste WCAG</h3>
            <p className={styles.subtext}>Verificación automática de accesibilidad según WCAG 2.1.</p>

            <div className={styles.grid}>
                {resolved.map((combo, i) => {
                    const ratio = contrastRatio(combo.fg, combo.bg)
                    const level = wcagLevel(ratio)
                    const cssCombo = combinations[i]

                    return (
                        <div key={combo.label} className={styles.row}>
                            {/* Swatch */}
                            <div
                                className={styles.swatch}
                                style={{ background: cssCombo.bg }}
                            >
                                <span style={{ color: cssCombo.fg }}>Aa</span>
                            </div>

                            {/* Info */}
                            <div className={styles.info}>
                                <span className={styles.label}>{combo.label}</span>
                                <span className={styles.ratio}>{formatRatio(ratio)}</span>
                            </div>

                            {/* Level */}
                            <LevelBadge level={level} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
