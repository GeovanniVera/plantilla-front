import { useState } from 'react';
import { Outlet, useLocation, Link, NavLink, useNavigate } from 'react-router';
import {
  LuSettings,
  LuHouse,
  LuPalette,
  LuLogOut,
  LuUser,
  LuUsers,
  LuLayoutDashboard,
  LuShieldCheck,
  LuKeyRound,
  LuScrollText,
} from 'react-icons/lu';
import Sidebar from '@components/navigation/sidebar/Sidebar';
import SidebarLogo from '@components/navigation/sidebar/SidebarLogo';
import UserAvatar from '@components/navigation/sidebar/UserAvatar';
import UserClock from '@components/navigation/sidebar/UserClock';
import NavItem from '@components/navigation/sidebar/NavItem';
import NavGroup from '@components/navigation/sidebar/NavGroup';
import { useAuth } from '../auth';
import { Can } from '../auth/Can';
import { formatDisplayName } from '../lib/utils';
import styles from './MainLayout.module.css';

// ─── Route config ────────────────────────────────────────
interface RouteConfig {
  title: string;
  subtitle?: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Vista general del sistema.',
  },
  ajustes: { title: 'Ajustes', subtitle: 'Configuración de la aplicación.' },
  colores: { title: 'Colores de marca', subtitle: 'Personaliza los colores de la aplicación.' },
};

function Breadcrumbs() {
  const { pathname } = useLocation();

  // Don't show on home
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const items = segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const href = isLast ? undefined : '/' + segments.slice(0, i + 1).join('/');
    const config = ROUTE_CONFIG[seg];
    const label = config?.title ?? seg.charAt(0).toUpperCase() + seg.slice(1);

    return { label, href, isLast };
  });

  return (
    <nav className={styles.breadcrumbs}>
      {items.map((item, i) => (
        <span key={i} className={styles.crumb}>
          {i > 0 && <span className={styles.crumbSep}>›</span>}
          {item.isLast ? (
            <span className={styles.crumbCurrent}>{item.label}</span>
          ) : (
            <Link to={item.href!} className={styles.crumbLink}>
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function useActive(path: string) {
  const { pathname } = useLocation();
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

function AppNavItems() {
  const isActive = useActive;
  const [adminOpen, setAdminOpen] = useState(isActive('/admin'));

  return (
    <>
      <NavItem to="/dashboard" icon={LuHouse} label="Dashboard" active={isActive('/dashboard')} />

      <Can privilege="users.read">
        <NavGroup
          icon={LuShieldCheck}
          label="Gestión de usuarios"
          open={adminOpen}
          active={isActive('/admin')}
          onToggle={() => setAdminOpen((p) => !p)}
        >
          <NavItem
            as={NavLink}
            to="/admin"
            icon={LuLayoutDashboard}
            label="Índice"
            active={isActive('/admin') && !isActive('/admin/')}
          />
          <Can privilege="users.read">
            <NavItem
              as={NavLink}
              to="/admin/usuarios"
              icon={LuUsers}
              label="Usuarios"
              active={isActive('/admin/usuarios')}
            />
          </Can>
          <Can privilege="roles.read">
            <NavItem
              as={NavLink}
              to="/admin/roles"
              icon={LuShieldCheck}
              label="Roles"
              active={isActive('/admin/roles')}
            />
          </Can>
          <Can privilege="permissions.read">
            <NavItem
              as={NavLink}
              to="/admin/permisos"
              icon={LuKeyRound}
              label="Permisos"
              active={isActive('/admin/permisos')}
            />
          </Can>
          <Can privilege="audit.read">
            <NavItem
              as={NavLink}
              to="/admin/auditoria"
              icon={LuScrollText}
              label="Auditoría"
              active={isActive('/admin/auditoria')}
            />
          </Can>
        </NavGroup>
      </Can>
    </>
  );
}

function AppFooter() {
  const isActive = useActive;
  const [ajustesOpen, setAjustesOpen] = useState(isActive('/ajustes'));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <NavGroup
        icon={LuSettings}
        label="Ajustes"
        open={ajustesOpen}
        active={isActive('/ajustes')}
        onToggle={() => setAjustesOpen((p) => !p)}
      >
        <NavItem
          as={NavLink}
          to="/ajustes"
          icon={LuLayoutDashboard}
          label="Índice"
          active={isActive('/ajustes') && !isActive('/ajustes/')}
        />
        <NavItem
          as={NavLink}
          to="/ajustes/perfil"
          icon={LuUser}
          label="Mi perfil"
          active={isActive('/ajustes/perfil')}
        />
        <Can anyOf={['audit.read', 'audit.read-mine']}>
          <NavItem
            as={NavLink}
            to="/ajustes/actividad"
            icon={LuScrollText}
            label="Mi actividad"
            active={isActive('/ajustes/actividad')}
          />
        </Can>
        <Can privilege="settings.brand">
          <NavItem
            as={NavLink}
            to="/ajustes/colores"
            icon={LuPalette}
            label="Colores de marca"
            active={isActive('/ajustes/colores')}
          />
        </Can>
      </NavGroup>
      <NavItem as="button" icon={LuLogOut} label="Cerrar sesión" danger onClick={handleLogout} />
    </>
  );
}

export default function MainLayout() {
  const { user } = useAuth();
  const userName = formatDisplayName(user?.name ?? 'Usuario');
  const userPhoto = user?.photoUrl;
  const roles = user?.roles ?? [];
  const userRole = roles.length === 0 ? '' : roles.length === 1 ? roles[0] : 'Multi rol';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar>
        <Sidebar.Header>
          <SidebarLogo src="/logo.svg" name="Semilla Tecnológica" />
          <UserAvatar name={userName} role={userRole} photoUrl={userPhoto} />
          <UserClock />
        </Sidebar.Header>

        <Sidebar.Toggle />

        <Sidebar.Nav>
          <AppNavItems />
        </Sidebar.Nav>

        <Sidebar.Footer>
          <AppFooter />
        </Sidebar.Footer>
      </Sidebar>

      <main className={styles.main}>
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
  );
}
