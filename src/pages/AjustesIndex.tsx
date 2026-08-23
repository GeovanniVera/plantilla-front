import { Link } from 'react-router'
import { LuPalette } from 'react-icons/lu'
import styles from './TablesShowcase.module.css'

const settings = [
    { to: '/ajustes/colores', icon: LuPalette, label: 'Colores de marca', desc: 'Personaliza los colores de tu aplicación. Los cambios se aplican en vivo.' },
]

export default function AjustesIndex() {
    return (
        <div className={styles.page}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
            }}>
                {settings.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                padding: 20,
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                background: 'var(--bg)',
                                textDecoration: 'none',
                                transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-border)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: 'var(--accent-bg)',
                                color: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                                    {item.desc}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
