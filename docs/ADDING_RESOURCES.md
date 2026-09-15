# Cómo añadir un recurso nuevo

## 1. Definir tipos

Crear `src/lib/api/types/{resource}.ts`:

```ts
export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
}
```

## 2. Crear servicio

Crear `src/lib/api/services/{resource}.service.ts`:

```ts
import { client } from '../client';
import type { ApiResponse } from '../types/api-response';
import type { Product, CreateProductInput } from '../types/{resource}';

export const {resource}Service = {
  list: (): Promise<ApiResponse<Product[]>> =>
    client.get<Product[]>('/{resources}'),

  get: (id: string): Promise<ApiResponse<Product>> =>
    client.get<Product>(`/{resources}/${id}`),

  create: (data: CreateProductInput): Promise<ApiResponse<Product>> =>
    client.post<Product>('/{resources}', data),

  update: (id: string, data: Partial<CreateProductInput>): Promise<ApiResponse<Product>> =>
    client.put<Product>(`/{resources}/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    client.delete<void>(`/{resources}/${id}`),
};
```

## 3. Crear hook con React Query

Crear `src/hooks/use{Resource}.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {resource}Service } from '../lib/api/services/{resource}.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => {resource}Service.list(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: {resource}Service.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

## 4. Agregar mock handler

Agregar en `src/test/mocks/handlers/{resource}.ts`:

```ts
import { http, HttpResponse } from 'msw';

export const {resource}Handlers = [
  http.get('*/{resources}', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
```

Registrar en `src/test/mocks/server.ts`.

## 5. Agregar rutas

Agregar en `src/routes/index.ts` o crear nuevo archivo de ruta.

## 6. Agregar tests

Crear `src/lib/api/services/{resource}.service.test.ts` o `src/hooks/use{Resource}.test.ts`.

## 7. Exportar del barrel

Si el servicio tiene acceso público, agregar en `src/lib/api/services/index.ts`.
