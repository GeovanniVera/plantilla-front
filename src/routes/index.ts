import type { RouteObject } from 'react-router';
import { showcaseRoutes } from './showcase';
import { ajustesRoutes } from './ajustes';
import { examplesRoutes } from './examples';

/**
 * All application routes grouped by domain.
 *
 * To add a new module:
 * 1. Create src/routes/your-module.tsx
 * 2. Export a RouteObject[] array
 * 3. Import and spread it here
 */
export const routes: RouteObject[] = [...showcaseRoutes, ...ajustesRoutes, ...examplesRoutes];
