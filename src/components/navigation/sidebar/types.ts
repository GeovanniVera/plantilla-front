import type { IconType } from 'react-icons';

export interface NavItem {
  to: string;
  icon: IconType;
  label: string;
  danger?: boolean;
}

export interface GroupItem {
  id: string;
  icon: IconType;
  label: string;
  basePath: string;
  children: NavItem[];
}
