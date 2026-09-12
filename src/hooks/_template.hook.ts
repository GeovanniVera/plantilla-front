import { useQuery } from '@tanstack/react-query'

/**
 * Template for React Query hooks.
 * Copy and customize for each resource.
 */
export function useTemplateList() {
  return useQuery({
    queryKey: ['resource'],
    queryFn: async () => {
      // const response = await templateService.getAll()
      // if (!response.success) throw new Error(response.message)
      // return response.data
    },
  })
}

export function useTemplateItem(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      // const response = await templateService.getById(id)
      // if (!response.success) throw new Error(response.message)
      // return response.data
    },
    enabled: !!id,
  })
}
