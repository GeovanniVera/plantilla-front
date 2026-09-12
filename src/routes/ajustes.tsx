import { lazy } from 'react';
import type { RouteObject } from 'react-router';

// Lazy-loaded ajustes
const AjustesIndex = lazy(() => import('../pages/ajustes/AjustesIndex'));
const BrandColorSettings = lazy(() => import('../features/settings/BrandColorSettings'));

export const ajustesRoutes: RouteObject[] = [
  { path: '/ajustes', element: <AjustesIndex /> },
  {
    path: '/ajustes/colores',
    element: (
      <div style={{ padding: 32 }}>
        <BrandColorSettings />
      </div>
    ),
  },
];
