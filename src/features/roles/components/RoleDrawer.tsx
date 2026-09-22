import { useState, useId } from 'react';
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
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header stays a direct child so Drawer can name the dialog from its title. */}
      <Drawer.Header title={role ? 'Detalle del rol' : 'Crear rol'} />
      {/*
       * The form is keyed by role id: opening a different role remounts it
       * with fresh initial state, while a refetch that returns a new object
       * with the same id leaves the in-progress edits untouched. `Drawer`
       * unmounts its children while closed, so reopening also starts clean.
       */}
      <RoleDrawerContent key={role?.id ?? 'create'} role={role} onClose={onClose} />
    </Drawer>
  );
}

interface RoleDrawerContentProps {
  role: Role | null;
  onClose: () => void;
}

function RoleDrawerContent({ role, onClose }: RoleDrawerContentProps) {
  const toast = useToast();
  // Initial state comes straight from the role; state never has to chase the
  // prop, so a new object identity cannot wipe what the user is editing.
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    () => new Set(role?.permissions.map((p) => p.id) ?? []),
  );
  const nameId = useId();
  const descriptionId = useId();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  // La ruta solo exige roles.read: /admin/permissions requiere permissions.read
  // y, sin él, el backend responde 403 y onForbidden redirige. Se gatea por
  // privilegio: este contenido solo se monta con el drawer abierto.
  const canReadPermissions = useHasPrivilege('permissions.read');
  const { data: permissions = [] } = usePermissions({
    enabled: canReadPermissions,
  });

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
        <div className="text-fg-muted text-sm">Nombre</div>
        <p className="text-fg text-sm font-medium">{role.name}</p>
      </div>
      <div>
        <div className="text-fg-muted text-sm">Descripción</div>
        <p className="text-fg text-sm">{role.description || '—'}</p>
      </div>
      <div>
        <div className="text-fg mb-2 block text-sm font-medium">Permisos</div>
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
    <>
      <Drawer.Body>
        <Can privilege="roles.write" fallback={readOnlyView}>
          <div className="space-y-4">
            <div>
              <label htmlFor={nameId} className="text-fg mb-1.5 block text-sm font-medium">
                Nombre
              </label>
              <Input
                id={nameId}
                type="text"
                value={name}
                onChange={setName}
                placeholder="ej: admin"
                required
              />
            </div>
            <div>
              <label htmlFor={descriptionId} className="text-fg mb-1.5 block text-sm font-medium">
                Descripción
              </label>
              <Input
                id={descriptionId}
                type="text"
                value={description}
                onChange={setDescription}
                placeholder="Descripción del rol"
              />
            </div>
            <fieldset>
              <legend className="text-fg mb-2 block text-sm font-medium">Permisos</legend>
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
            </fieldset>
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
    </>
  );
}
