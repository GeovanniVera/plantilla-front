import ResponsiveTable from '@components/data-display/table/ResponsiveTable';
import { Can } from '../../../auth/Can';
import Button from '@components/primitives/Button';
import type { Role } from '../services/role.service';
import { LuTrash2 } from 'react-icons/lu';

interface RoleTableProps {
  roles: Role[];
  onRowClick: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleTable({ roles, onRowClick, onDelete }: RoleTableProps) {
  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      minWidth: '150px',
      filterType: 'text' as const,
    },
    {
      key: 'description',
      header: 'Descripción',
      minWidth: '250px',
      filterType: 'text' as const,
    },
    {
      key: 'permissions',
      header: 'Permisos',
      minWidth: '200px',
      filterType: 'select' as const,
      render: (value: unknown) => {
        const perms = value as { name: string }[];
        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, 3).map((p) => (
              <span
                key={p.name}
                className="bg-accent-subtle text-accent inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {p.name}
              </span>
            ))}
            {perms.length > 3 && <span className="text-fg-muted text-xs">+{perms.length - 3}</span>}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'right' as const,
      render: (_: unknown, row: Role) => (
        <div className="flex items-center justify-end gap-1">
          <Can privilege="roles.write">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              title="Eliminar"
              className="text-danger hover:text-danger-strong"
            >
              <LuTrash2 size={16} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={roles}
      keyExtractor={(row) => row.id}
      filters={true}
      pagination={true}
      pageSize={10}
      onRowClick={onRowClick}
      emptyTitle="Sin roles"
      emptyDescription="No se encontraron roles."
    />
  );
}
