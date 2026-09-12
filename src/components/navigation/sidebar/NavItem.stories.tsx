import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { LuHouse, LuLogOut } from 'react-icons/lu';
import NavItem from './NavItem';
import { SidebarContext } from './context';

const meta: Meta<typeof NavItem> = {
  title: 'Navigation/Sidebar/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarContext.Provider value={{ expanded: true, toggleExpanded: () => {} }}>
          <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
            <Story />
          </div>
        </SidebarContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    to: '/',
    icon: LuHouse,
    label: 'Inicio',
    active: false,
  },
};

export const Active: Story = {
  args: {
    to: '/',
    icon: LuHouse,
    label: 'Inicio',
    active: true,
  },
};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SidebarContext.Provider value={{ expanded: false, toggleExpanded: () => {} }}>
        <div style={{ width: 80, background: 'var(--bg)', padding: 12 }}>
          <Story />
        </div>
      </SidebarContext.Provider>
    ),
  ],
  args: {
    to: '/',
    icon: LuHouse,
    label: 'Inicio',
    active: false,
  },
};

export const Danger: Story = {
  args: {
    to: '/logout',
    icon: LuLogOut,
    label: 'Cerrar sesión',
    danger: true,
    active: false,
  },
};
