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
  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      minWidth: '200px',
      filterType: 'text' as const,
    },
    {
      key: 'email',
      header: 'Email',
      minWidth: '250px',
      filterType: 'text' as const,
    },
    {
      key: 'roles',
      header: 'Roles',
      minWidth: '150px',
      filterType: 'select' as const,
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
      header: 'Estado',
      minWidth: '120px',
      filterType: 'select' as const,
      filterOptions: ['Activo', 'Suspendido', 'Sin verificar'],
      render: (value: unknown, row: AdminUser) => (
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
                title="Suspender"
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
                title="Reactivar"
              >
                <LuShieldOff size={16} />
              </Button>
            )}
          </Can>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={users}
      keyExtractor={(row) => row.id}
      filters={true}
      pagination={true}
      pageSize={10}
      onRowClick={onRowClick}
      emptyTitle="Sin usuarios"
      emptyDescription="No se encontraron usuarios con los filtros aplicados."
    />
  );
}
