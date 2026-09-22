import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { auditService, type AuditFilters } from '../services/audit.service';

/**
 * Auditoría completa (requiere audit.read).
 *
 * `keepPreviousData` mantiene la página anterior visible mientras llega la
 * nueva, evitando que la tabla parpadee a vacío al paginar o filtrar.
 */
export function useAuditLogs(page = 0, size = 10, filters?: AuditFilters) {
  return useQuery({
    queryKey: ['admin', 'audit', page, size, filters],
    queryFn: async () => {
      const response = await auditService.list(page, size, filters);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al consultar auditoría');
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Solo la actividad del usuario autenticado (endpoint /mine, anti-IDOR). */
export function useMyAuditLogs(page = 0, size = 10, filters?: AuditFilters) {
  return useQuery({
    queryKey: ['audit', 'mine', page, size, filters],
    queryFn: async () => {
      const response = await auditService.listMine(page, size, filters);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al consultar tu actividad');
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}
