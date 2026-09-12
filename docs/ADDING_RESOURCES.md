# Cómo Añadir un Recurso — Plantilla Front

Guía paso a paso para añadir un recurso nuevo (ej: Products, Orders, etc.).

## Paso 1: Definir tipos

Crear `src/lib/api/types/product.ts`:

```ts
import type { ApiResponse } from './api-response'

export interface Product {
  id: string
  name: string
  price: number
  category: string
  createdAt: string
}

export type ProductListResponse = ApiResponse<Product[]>
export type ProductDetailResponse = ApiResponse<Product>
```

## Paso 2: Crear servicio

Crear `src/lib/api/services/product.service.ts`:

```ts
import { client } from '../client'
import type { ProductListResponse, ProductDetailResponse } from '../types/product'

export const productService = {
  list: () => client.get<ProductListResponse>('/products'),
  get: (id: string) => client.get<ProductDetailResponse>(`/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt'>) =>
    client.post<ProductDetailResponse>('/products', data),
  update: (id: string, data: Partial<Product>) =>
    client.put<ProductDetailResponse>(`/products/${id}`, data),
  delete: (id: string) => client.delete(`/products/${id}`),
}
```

## Paso 3: Crear hooks React Query

Crear `src/hooks/useProducts.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@lib/api/services/product.service'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.list()
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al cargar productos')
      }
      return response.data
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await productService.get(id)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Producto no encontrado')
      }
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

## Paso 4: Crear página

Crear `src/pages/products/ProductsPage.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { useProducts } from '../../hooks/useProducts'

export default function ProductsPage() {
  const { t } = useTranslation()
  const { data: products, isLoading, error } = useProducts()

  if (isLoading) return <div>{t('common.loading')}</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{t('products.title')}</h1>
      {/* ... */}
    </div>
  )
}
```

## Paso 5: Añadir ruta

Actualizar `src/routes/index.ts`:

```ts
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'))

// Agregar al array de rutas:
{
  path: '/products',
  element: <ProductsPage />,
  label: 'Productos',
  icon: LuPackage,
}
```

## Paso 6: Añadir traducciones

Actualizar `src/lib/i18n/locales/es.json`:

```json
{
  "products": {
    "title": "Productos",
    "create": "Crear producto",
    "edit": "Editar producto",
    "delete": "Eliminar producto"
  }
}
```

## Paso 7: Añadir test

Crear `src/pages/products/ProductsPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductsPage } from './ProductsPage'

describe('ProductsPage', () => {
  it('renders title', () => {
    render(<ProductsPage />)
    expect(screen.getByText('Productos')).toBeInTheDocument()
  })
})
```

## Resumen

| Paso | Archivo | Acción |
|------|---------|--------|
| 1 | `src/lib/api/types/product.ts` | Definir tipos |
| 2 | `src/lib/api/services/product.service.ts` | Crear servicio |
| 3 | `src/hooks/useProducts.ts` | Crear hooks |
| 4 | `src/pages/products/ProductsPage.tsx` | Crear página |
| 5 | `src/routes/index.ts` | Añadir ruta |
| 6 | `src/lib/i18n/locales/es.json` | Añadir traducciones |
| 7 | `src/pages/products/ProductsPage.test.tsx` | Añadir test |
