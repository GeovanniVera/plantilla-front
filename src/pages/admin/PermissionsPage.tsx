import ResponsiveTable from '@components/data-display/table/ResponsiveTable';
import { usePermissions } from '../../features/roles/hooks/useRoles';

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = usePermissions();

  const columns = [
    {
      key: 'name',
      header: 'Permiso',
      minWidth: '200px',
      filterType: 'text' as const,
    },
    {
      key: 'description',
      header: 'Descripción',
      minWidth: '300px',
      filterType: 'text' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">Cargando permisos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div>
          <h2 className="text-fg text-lg font-semibold">Permisos</h2>
          <p className="text-fg-muted text-sm">{permissions.length} permisos en el catálogo</p>
        </div>

        <ResponsiveTable
          columns={columns}
          data={permissions}
          keyExtractor={(row) => row.id}
          filters={true}
          pagination={true}
          pageSize={10}
          emptyTitle="Sin permisos"
          emptyDescription="No se encontraron permisos."
        />
      </div>
    </div>
  );
}
