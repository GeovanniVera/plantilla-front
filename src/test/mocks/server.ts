import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { notificationHandlers } from './handlers/notifications';

export const server = setupServer(...authHandlers, ...notificationHandlers);
