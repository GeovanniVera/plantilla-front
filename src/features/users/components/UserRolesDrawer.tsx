import { useState, useEffect } from 'react';
import { Drawer } from '@components/overlays/Drawer';
import Button from '@components/primitives/Button';
import { Can } from '../../../auth/Can';
import { useHasPrivilege } from '../../../auth/hooks';
import { CheckboxSearchList } from '../../../components/forms/CheckboxSearchList';
import { useToast } from '@components/feedback';
import { useRoles, useAssignRolesToUser } from '../../roles/hooks/useRoles';
import type { AdminUser } from '../services/user.service';
import type { Role } from '../../roles/services/role.service';

// Referencia estable para el default de la query: si el fetch está deshabilitado
// `data` queda undefined y un `[]` inline cambiaría de identidad en cada render,
// realimentando el useEffect que sincroniza `selectedRoles`.
const EMPTY_ROLES: Role[] = [];

interface UserRolesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function UserRolesDrawer({ isOpen, onClose, user }: UserRolesDrawerProps) {
  const toast = useToast();
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  // La ruta solo exige users.read: /admin/roles requiere roles.read y, sin él,
  // el backend responde 403 y onForbidden redirige. Se gatea por privilegio y
  // por drawer abierto para no pedir nada hasta que se use.
  const canReadRoles = useHasPrivilege('roles.read');
  const {
    data: roles = EMPTY_ROLES,
    isSuccess: isCatalogLoaded,
    isLoading: isCatalogLoading,
  } = useRoles({ enabled: canReadRoles && isOpen });
  const assignRoles = useAssignRolesToUser();

  useEffect(() => {
    if (user && isOpen) {
      const userRoleNames = new Set(user.roles);
      const roleIds = roles.filter((r: Role) => userRoleNames.has(r.name)).map((r: Role) => r.id);
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
    // Este guard NO evita una pérdida de datos: el backend rechaza un `roleIds`
    // vacío con 400 (@NotEmpty + @Valid) antes de tocar los roles del usuario,
    // así que un envío vacío no puede borrarlos. Existe para que la UI no envíe
    // un set que no pudo mostrar (sin catálogo `selectedRoles` queda vacío) y que
    // el usuario nunca eligió. El botón ya está deshabilitado; esto es defensa extra.
    if (!user || !isCatalogLoaded) return;
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

  // Los nombres de `user.roles` vienen de users.read y son la fuente de verdad
  // de los roles del usuario; el catálogo solo aporta descripciones. Derivar los
  // badges del catálogo mostraría "Sin roles asignados" si no está disponible.
  const currentRoles = (
    <div className="space-y-2">
      <div className="text-fg-muted text-sm">Roles actuales</div>
      <div className="flex flex-wrap gap-1">
        {user.roles.length > 0 ? (
          user.roles.map((roleName) => (
            <span
              key={roleName}
              className="bg-accent-subtle text-accent inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {roleName}
            </span>
          ))
        ) : (
          <span className="text-fg-muted text-xs">Sin roles asignados</span>
        )}
      </div>
    </div>
  );

  // Vista de solo lectura para quien no tiene roles.assign
  const readOnlyView = currentRoles;

  // Sin catálogo verificado no se ofrece el picker: una lista vacía haría creer
  // que no existe ningún rol y habilitaría el guardado de un set que el usuario
  // nunca eligió. El backend igual lo rechazaría con 400; no hay borrado posible.
  const catalogUnavailableView = (
    <div className="space-y-4">
      {currentRoles}
      <p className="text-fg-muted text-xs">
        {isCatalogLoading
          ? 'Cargando roles...'
          : canReadRoles
            ? 'No se pudieron cargar los roles. No es posible asignarlos sin el catálogo.'
            : 'No tienes permiso para ver el catálogo de roles, por lo que no es posible asignarlos.'}
      </p>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header title={`Roles de ${user.name}`} />
      <Drawer.Body>
        <div className="space-y-4">
          <div>
            <div className="text-fg-muted text-sm">Email</div>
            <p className="text-fg text-sm font-medium">{user.email}</p>
          </div>

          <Can privilege="roles.assign" fallback={readOnlyView}>
            {isCatalogLoaded ? (
              <fieldset>
                <legend className="text-fg mb-2 block text-sm font-medium">Roles</legend>
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
              </fieldset>
            ) : (
              catalogUnavailableView
            )}
          </Can>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Can privilege="roles.assign">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isCatalogLoaded || assignRoles.isPending}
          >
            {assignRoles.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </Can>
      </Drawer.Footer>
    </Drawer>
  );
}
