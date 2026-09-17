import { useState } from 'react';
import { Can } from '../../auth/Can';
import Button from '@components/primitives/Button';
import { RoleTable } from '../../features/roles/components/RoleTable';
import { RoleDrawer } from '../../features/roles/components/RoleDrawer';
import { useRoles, useDeleteRole } from '../../features/roles/hooks/useRoles';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { useToast } from '@components/feedback';
import type { Role } from '../../features/roles/services/role.service';
import { LuPlus } from 'react-icons/lu';

export default function RolesPage() {
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const handleCreate = () => {
    setSelectedRole(null);
    setDrawerOpen(true);
  };

  const handleRowClick = (role: Role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    try {
      await deleteRoleMutation.mutateAsync(deleteRole.id);
      toast.success(`Rol ${deleteRole.name} eliminado`);
    } catch {
      toast.error('Error al eliminar el rol');
    }
    setDeleteRole(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">Cargando roles...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-fg text-lg font-semibold">Roles</h2>
            <p className="text-fg-muted text-sm">{roles.length} roles en el sistema</p>
          </div>
          <Can privilege="roles.write">
            <Button variant="primary" onClick={handleCreate}>
              <LuPlus size={16} className="mr-1" />
              Crear rol
            </Button>
          </Can>
        </div>

        <RoleTable roles={roles} onRowClick={handleRowClick} onDelete={setDeleteRole} />
      </div>

      <RoleDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />

      {deleteRole && (
        <ConfirmDialog
          isOpen={!!deleteRole}
          onClose={() => setDeleteRole(null)}
          onConfirm={handleDelete}
          title="Eliminar rol"
          message={`¿Eliminar el rol ${deleteRole.name}? No se puede eliminar si está asignado a usuarios.`}
          confirmLabel="Eliminar"
          variant="destructive"
        />
      )}
    </div>
  );
}
