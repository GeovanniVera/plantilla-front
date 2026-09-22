import { MemoryRouter } from 'react-router';
import { LuBlocks, LuCalendar, LuHouse, LuSettings } from 'react-icons/lu';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Sidebar from '../sidebar/Sidebar';
import SidebarLogo from '../sidebar/SidebarLogo';
import NavItem from '../sidebar/NavItem';
import UserClock from '../sidebar/UserClock';
import UserAvatar from '../sidebar/UserAvatar';
import { AuthProvider } from '../../../auth';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar/Compound',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    // Fixed positioning + 100vh need full-canvas stories.
    layout: 'fullscreen',
  },
};
export default meta;

const NAV = [
  { to: '/', icon: LuHouse, label: 'Inicio', active: true },
  { to: '/componentes', icon: LuBlocks, label: 'Componentes' },
  { to: '/calendario', icon: LuCalendar, label: 'Calendario' },
];

function CompoundDemo() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: 'var(--code-bg)', paddingLeft: 96 }}>
          <Sidebar>
            <Sidebar.Header>
              <SidebarLogo src="/logo.svg" name="Semilla Tecnológica" />
            </Sidebar.Header>
            <Sidebar.Toggle />
            <Sidebar.Nav>
              {NAV.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                />
              ))}
              <NavItem to="/ajustes" icon={LuSettings} label="Personalizar" />
            </Sidebar.Nav>
            <Sidebar.Footer>
              <UserClock />
              <UserAvatar name="Alejandro" role="Admin" />
            </Sidebar.Footer>
          </Sidebar>
        </div>
      </AuthProvider>
    </MemoryRouter>
  );
}

export const DesktopCollapsed: StoryObj = {
  render: () => <CompoundDemo />,
};

/**
 * Expanding reveals the footer identity (name + role) and the logo text.
 * Regression coverage for hotfix e192e5b.
 */
export const ExpandRevealsDetails: StoryObj = {
  render: () => <CompoundDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Expandir'));
    await expect(canvas.getByText('Colapsar')).not.toBeNull();
    await expect(canvas.getByText('Inicio')).not.toBeNull();

    const body = within(document.body);
    const nameEl = body.getByText('Alejandro');
    await expect(nameEl).not.toBeNull();

    // Expanded reveal: avatar info becomes visible (regression e192e5b)
    const infoVisible = () => {
      const cs = getComputedStyle(nameEl.parentElement!);
      return cs.display !== 'none';
    };
    await waitFor(() => expect(infoVisible()).toBe(true));
  },
};

/** Toggle interaction: Expandir -> Colapsar -> Expandir. */
export const ToggleInteraction: StoryObj = {
  render: () => <CompoundDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Expandir'));
    await expect(canvas.getByText('Colapsar')).not.toBeNull();
    await userEvent.click(canvas.getByText('Colapsar'));
    await expect(canvas.getByText('Expandir')).not.toBeNull();
  },
};

// ─── Mobile representation ────────────────────────────────
// Mobile rendering is driven by useIsMobile (matchMedia): narrowing the
// Storybook viewport below 768px activates it without any component hack.
// The sidebar needs a Router context (it reads useLocation), hence the
// MemoryRouter decorator here too.

function MobileDemo() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: 'var(--code-bg)' }}>
          <Sidebar>
            <Sidebar.Header>
              <SidebarLogo src="/logo.svg" name="Semilla Tecnológica" />
            </Sidebar.Header>
            <Sidebar.Nav>
              <NavItem to="/" icon={LuHouse} label="Inicio" active />
              <NavItem to="/componentes" icon={LuBlocks} label="Componentes" />
            </Sidebar.Nav>
          </Sidebar>
        </div>
      </AuthProvider>
    </MemoryRouter>
  );
}

export const MobileViewport: StoryObj = {
  render: () => <MobileDemo />,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
