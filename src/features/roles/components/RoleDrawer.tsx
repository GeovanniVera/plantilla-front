import { useState, useEffect } from 'react';
import { Drawer } from '@components/overlays/Drawer';
import Button from '@components/primitives/Button';
import Input from '@components/primitives/Input';
import { Can } from '../../../auth/Can';
import { useHasPrivilege } from '../../../auth/hooks';
import { CheckboxSearchList } from '../../../components/forms/CheckboxSearchList';
import { useToast } from '@components/feedback';
import { useCreateRole, useUpdateRole, usePermissions } from '../hooks/useRoles';
import type { Role, Permission } from '../services/role.service';

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDrawer({ isOpen, onClose, role }: RoleDrawerProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  // La ruta solo exige roles.read: /admin/permissions requiere permissions.read
  // y, sin él, el backend responde 403 y onForbidden redirige. Se gatea por
  // privilegio y por drawer abierto.
  const canReadPermissions = useHasPrivilege('permissions.read');
  const { data: permissions = [] } = usePermissions({
    enabled: canReadPermissions && isOpen,
  });

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? '');
      setSelectedPerms(new Set(role.permissions.map((p) => p.id)));
    } else {
      setName('');
      setDescription('');
      setSelectedPerms(new Set());
    }
  }, [role, isOpen]);

  const togglePerm = (permId: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const data = {
      name,
      description,
      permissionIds: Array.from(selectedPerms),
    };

    try {
      if (role) {
        await updateRole.mutateAsync({ id: role.id, data });
        toast.success(`Rol ${name} actualizado`);
      } else {
        await createRole.mutateAsync(data);
        toast.success(`Rol ${name} creado`);
      }
      onClose();
    } catch {
      toast.error('Error al guardar el rol');
    }
  };

  // Vista de solo lectura para quien no tiene roles.write
  const readOnlyView = role ? (
    <div className="space-y-4">
      <div>
        <label className="text-fg-muted text-sm">Nombre</label>
        <p className="text-fg text-sm font-medium">{role.name}</p>
      </div>
      <div>
        <label className="text-fg-muted text-sm">Descripción</label>
        <p className="text-fg text-sm">{role.description || '—'}</p>
      </div>
      <div>
        <label className="text-fg mb-2 block text-sm font-medium">Permisos</label>
        <div className="flex flex-wrap gap-1">
          {role.permissions.length > 0 ? (
            role.permissions.map((p) => (
              <span
                key={p.id}
                className="bg-accent-subtle text-accent inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {p.name}
              </span>
            ))
          ) : (
            <span className="text-fg-muted text-xs">Sin permisos asignados</span>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header title={role ? 'Detalle del rol' : 'Crear rol'} />
      <Drawer.Body>
        <Can privilege="roles.write" fallback={readOnlyView}>
          <div className="space-y-4">
            <div>
              <label className="text-fg mb-1.5 block text-sm font-medium">Nombre</label>
              <Input type="text" value={name} onChange={setName} placeholder="ej: admin" required />
            </div>
            <div>
              <label className="text-fg mb-1.5 block text-sm font-medium">Descripción</label>
              <Input
                type="text"
                value={description}
                onChange={setDescription}
                placeholder="Descripción del rol"
              />
            </div>
            <div>
              <label className="text-fg mb-2 block text-sm font-medium">Permisos</label>
              <CheckboxSearchList
                options={permissions.map((perm: Permission) => ({
                  id: perm.id,
                  label: perm.name,
                  description: perm.description,
                }))}
                selected={selectedPerms}
                onToggle={togglePerm}
                searchPlaceholder="Buscar permiso..."
                emptyMessage="No hay permisos en el catálogo"
                noResultsMessage="No se encontraron permisos"
              />
            </div>
          </div>
        </Can>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" onClick={onClose}>
          {role ? 'Cerrar' : 'Cancelar'}
        </Button>
        <Can privilege="roles.write">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name || createRole.isPending || updateRole.isPending}
          >
            {createRole.isPending || updateRole.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </Can>
      </Drawer.Footer>
    </Drawer>
  );
}
