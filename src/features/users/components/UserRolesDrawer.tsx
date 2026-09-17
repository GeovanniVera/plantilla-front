import { useState, useEffect } from 'react';
import { Drawer } from '@components/overlays/Drawer';
import Button from '@components/primitives/Button';
import { Can } from '../../../auth/Can';
import { CheckboxSearchList } from '../../../components/forms/CheckboxSearchList';
import { useToast } from '@components/feedback';
import { useRoles, useAssignRolesToUser } from '../../roles/hooks/useRoles';
import type { AdminUser } from '../services/user.service';
import type { Role } from '../../roles/services/role.service';

interface UserRolesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function UserRolesDrawer({ isOpen, onClose, user }: UserRolesDrawerProps) {
  const toast = useToast();
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const { data: roles = [] } = useRoles();
  const assignRoles = useAssignRolesToUser();

  useEffect(() => {
    if (user && isOpen) {
      const roleIds = roles.filter((r: Role) => user.roles.includes(r.name)).map((r: Role) => r.id);
      setSelectedRoles(new Set(roleIds));
    }
  }, [user, isOpen, roles]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await assignRoles.mutateAsync({
        userId: user.id,
        roleIds: Array.from(selectedRoles),
      });
      toast.success(`Roles de ${user.name} actualizados`);
      onClose();
    } catch {
      toast.error('Error al asignar roles');
    }
  };

  if (!user) return null;

  const userRoleNames = new Set(user.roles);
  const userRoles = roles.filter((r: Role) => userRoleNames.has(r.name));

  // Vista de solo lectura para quien no tiene roles.assign
  const readOnlyView = (
    <div className="space-y-2">
      <label className="text-fg-muted text-sm">Roles actuales</label>
      <div className="flex flex-wrap gap-1">
        {userRoles.length > 0 ? (
          userRoles.map((role: Role) => (
            <span
              key={role.id}
              className="bg-accent-subtle text-accent inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {role.name}
            </span>
          ))
        ) : (
          <span className="text-fg-muted text-xs">Sin roles asignados</span>
        )}
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header title={`Roles de ${user.name}`} />
      <Drawer.Body>
        <div className="space-y-4">
          <div>
            <label className="text-fg-muted text-sm">Email</label>
            <p className="text-fg text-sm font-medium">{user.email}</p>
          </div>

          <Can privilege="roles.assign" fallback={readOnlyView}>
            <div>
              <label className="text-fg mb-2 block text-sm font-medium">Roles</label>
              <CheckboxSearchList
                options={roles.map((role: Role) => ({
                  id: role.id,
                  label: role.name,
                  description: role.description,
                }))}
                selected={selectedRoles}
                onToggle={toggleRole}
                searchPlaceholder="Buscar rol..."
                emptyMessage="No hay roles en el sistema"
                noResultsMessage="No se encontraron roles"
              />
            </div>
          </Can>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Can privilege="roles.assign">
          <Button variant="primary" onClick={handleSave} disabled={assignRoles.isPending}>
            {assignRoles.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </Can>
      </Drawer.Footer>
    </Drawer>
  );
}
