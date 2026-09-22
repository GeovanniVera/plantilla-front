import { useTranslation } from 'react-i18next';
import ResponsiveTable from '@components/data-display/table/ResponsiveTable';
import { Can } from '../../../auth/Can';
import Button from '@components/primitives/Button';
import { UserStatusBadge } from './UserStatusBadge';
import type { AdminUser } from '../services/user.service';
import { LuShieldOff } from 'react-icons/lu';

interface UserTableProps {
  users: AdminUser[];
  onSuspend: (user: AdminUser) => void;
  onReactivate: (user: AdminUser) => void;
  onRowClick: (user: AdminUser) => void;
}

export function UserTable({ users, onSuspend, onReactivate, onRowClick }: UserTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      key: 'name',
      header: t('admin.users.table.name'),
      minWidth: '200px',
    },
    {
      key: 'email',
      header: t('admin.users.table.email'),
      minWidth: '250px',
    },
    {
      key: 'roles',
      header: t('admin.users.table.roles'),
      minWidth: '150px',
      render: (value: unknown) => {
        const roles = value as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <span
                key={role}
                className="bg-accent-subtle text-accent inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t('admin.users.table.status'),
      minWidth: '120px',
      render: (_: unknown, row: AdminUser) => (
        <UserStatusBadge suspended={row.suspended} isVerified={row.isVerified} />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'right' as const,
      render: (_: unknown, row: AdminUser) => (
        <div className="flex items-center justify-end gap-1">
          <Can privilege="users.write">
            {!row.suspended ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuspend(row);
                }}
                title={t('admin.users.actions.suspend')}
              >
                <LuShieldOff size={16} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate(row);
                }}
                title={t('admin.users.actions.reactivate')}
              >
                <LuShieldOff size={16} />
              </Button>
            )}
          </Can>
        </div>
      ),
    },
  ];

  // Sin paginación ni filtros internos: el servidor pagina, filtra y ordena.
  // Activar `pagination` re-cortaría en cliente la página ya paginada
  // (doble paginación) y los filtros de cabecera solo verían la página actual.
  return (
    <ResponsiveTable
      columns={columns}
      data={users}
      keyExtractor={(row) => row.id}
      pagination={false}
      onRowClick={onRowClick}
      emptyTitle={t('admin.users.empty.title')}
      emptyDescription={t('admin.users.empty.description')}
    />
  );
}
