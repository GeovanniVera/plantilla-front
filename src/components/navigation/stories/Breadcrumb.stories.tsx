import { Breadcrumb } from '../Breadcrumb';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuHouse } from 'react-icons/lu';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};
export default meta;

const threeItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Componentes', href: '/componentes' },
  { label: 'Tablas', href: '/componentes/tablas' },
];

export const Default: StoryObj<typeof Breadcrumb> = {
  render: (args) => <Breadcrumb {...args} />,
  args: { items: threeItems },
};

/** With icon on the first item and a current (non-link) last item. */
export const WithIconsAndCurrent: StoryObj<typeof Breadcrumb> = {
  render: (args) => <Breadcrumb {...args} />,
  args: {
    items: [
      { label: 'Inicio', href: '/', icon: <LuHouse /> },
      { label: 'Ajustes', href: '/ajustes' },
      { label: 'Colores', href: '/ajustes/colores' },
    ],
  },
};

/** More than 3 items collapses the middle into an ellipsis button. */
export const CollapsedMiddle: StoryObj<typeof Breadcrumb> = {
  render: (args) => <Breadcrumb {...args} />,
  args: {
    items: [
      { label: 'Inicio', href: '/' },
      { label: 'Nivel 2', href: '/n2' },
      { label: 'Nivel 3', href: '/n3' },
      { label: 'Nivel 4', href: '/n4' },
      { label: 'Actual', href: '/n5' },
    ],
  },
};

/** Text separator instead of the chevron icon. */
export const TextSeparator: StoryObj<typeof Breadcrumb> = {
  render: (args) => <Breadcrumb {...args} />,
  args: {
    separator: '/',
    items: threeItems,
  },
};
