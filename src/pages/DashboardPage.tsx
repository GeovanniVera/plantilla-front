/**
 * Dashboard page - default landing after login.
 */
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import Badge from '@components/primitives/Badge';
import Card from '@components/layout/Card';
import { StatCard, StatCardGroup } from '@components/layout/StatCard';
import { useUnreadCount } from '../features/notifications/hooks/useNotifications';
import {
  LuBell,
  LuFolderOpen,
  LuCreditCard,
  LuUsers,
  LuShieldCheck,
  LuKeyRound,
  LuArrowRight,
} from 'react-icons/lu';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, hasPrivilege } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();

  const quickActions = [
    {
      to: '/admin/usuarios',
      icon: LuUsers,
      title: 'Usuarios',
      desc: 'Ver, suspender y reactivar usuarios.',
      privilege: 'users.read',
      accent: '#6366f1',
    },
    {
      to: '/admin/roles',
      icon: LuShieldCheck,
      title: 'Roles',
      desc: 'Crear y editar roles con permisos.',
      privilege: 'roles.read',
      accent: '#10b981',
    },
    {
      to: '/admin/permisos',
      icon: LuKeyRound,
      title: 'Permisos',
      desc: 'Catálogo de permisos del sistema.',
      privilege: 'permissions.read',
      accent: '#f59e0b',
    },
  ];

  // Single source of truth for the permission check: filter before rendering so
  // the section heading and grid share the exact same visibility rule.
  const visibleActions = quickActions.filter((action) => hasPrivilege(action.privilege));

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-6">
        {/* Bienvenida */}
        <Card variant="elevated">
          <Card.Body>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-fg text-xl font-bold">Bienvenido, {user?.name}</h2>
              </div>
              <div className="flex gap-2">
                {user?.roles?.map((role) => (
                  <Badge key={role} variant="info">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Stats */}
        <StatCardGroup>
          <StatCard
            value={unreadCount}
            label={t('notifications.title')}
            icon={LuBell}
            accent="#6366f1"
          />
          <StatCard value={0} label="Archivos" icon={LuFolderOpen} accent="#10b981" />
          <StatCard value={0} label="Pagos" icon={LuCreditCard} accent="#f59e0b" />
        </StatCardGroup>

        {/* Acciones rápidas: la sección entera desaparece si no hay acciones visibles. */}
        {visibleActions.length > 0 && (
          <div>
            <h3 className="text-fg mb-3 text-sm font-semibold tracking-wide uppercase">
              Acciones rápidas
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.to}
                    variant="default"
                    className="h-full"
                    onClick={() => navigate(action.to)}
                  >
                    <Card.Body>
                      <div className="flex items-start justify-between gap-3">
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: `${action.accent}12`,
                            color: action.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <LuArrowRight size={16} className="text-fg-muted" />
                      </div>
                      <div className="mt-4">
                        <div className="text-fg text-sm font-semibold">{action.title}</div>
                        <div className="text-fg-muted mt-1 text-xs leading-relaxed">
                          {action.desc}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
