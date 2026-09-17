import { useQuery } from '@tanstack/react-query';
import { auditService, type AuditFilters } from '../services/audit.service';

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
  });
}
