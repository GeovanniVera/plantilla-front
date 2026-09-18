import { Link } from 'react-router';
import { Can } from '../../auth/Can';
import { LuUsers, LuShield, LuKeyRound, LuScrollText } from 'react-icons/lu';

const adminSections = [
  {
    to: '/admin/usuarios',
    icon: LuUsers,
    label: 'Usuarios',
    desc: 'Ver, suspender y reactivar usuarios.',
    privilege: 'users.read',
  },
  {
    to: '/admin/roles',
    icon: LuShield,
    label: 'Roles',
    desc: 'Crear, editar y eliminar roles con permisos.',
    privilege: 'roles.read',
  },
  {
    to: '/admin/permisos',
    icon: LuKeyRound,
    label: 'Permisos',
    desc: 'Catálogo de permisos del sistema (solo lectura).',
    privilege: 'permissions.read',
  },
  {
    to: '/admin/auditoria',
    icon: LuScrollText,
    label: 'Auditoría',
    desc: 'Consulta de eventos de seguridad y negocio (solo lectura).',
    privilege: 'audit.read',
  },
];

export default function AdminIndexPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-6">
        <div>
          <h2 className="text-fg text-lg font-semibold">Gestión de usuarios</h2>
          <p className="text-fg-muted text-sm">
            Administración de usuarios, roles y permisos del sistema.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {adminSections.map((item) => {
            const Icon = item.icon;
            return (
              <Can key={item.to} privilege={item.privilege}>
                <Link
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
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-h)',
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                </Link>
              </Can>
            );
          })}
        </div>
      </div>
    </div>
  );
}
