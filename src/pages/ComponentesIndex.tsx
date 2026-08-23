import { Link } from 'react-router'
import { LuMousePointerClick, LuCreditCard, LuTable2, LuTextCursorInput, LuPanelRightOpen, LuBell, LuNavigation, LuCalendar } from 'react-icons/lu'
import styles from './TablesShowcase.module.css'

const components = [
    { to: '/componentes/botones', icon: LuMousePointerClick, label: 'Botones', desc: 'Variantes primario, secundario, ghost con tamaños sm/md/lg' },
    { to: '/componentes/cards', icon: LuCreditCard, label: 'Cards', desc: 'Tarjetas con header, body y título' },
    { to: '/componentes/tablas', icon: LuTable2, label: 'Tablas', desc: 'DataTable, ExcelTable con filtros, paginación y edición inline' },
    { to: '/componentes/formularios', icon: LuTextCursorInput, label: 'Formularios', desc: 'Constructor de formularios con validación, multi-paso y código generado' },
    { to: '/componentes/modales', icon: LuPanelRightOpen, label: 'Modales', desc: 'Modal centrado, Drawer lateral y ConfirmDialog' },
    { to: '/componentes/notificaciones', icon: LuBell, label: 'Notificaciones', desc: 'Toast/Snackbar con API imperativa y 4 variantes' },
    { to: '/componentes/navegacion', icon: LuNavigation, label: 'Navegación', desc: 'Tabs (3 variantes) y Breadcrumb responsive' },
    { to: '/componentes/calendario', icon: LuCalendar, label: 'Calendario', desc: 'Componente de calendario con vista mensual y semanal' }
]

export default function ComponentesIndex() {
    return (
        <div className={styles.page}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
            }}>
                {components.map((comp) => {
                    const Icon = comp.icon
                    return (
                        <Link
                            key={comp.to}
                            to={comp.to}
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
                                    {comp.label}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                                    {comp.desc}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
