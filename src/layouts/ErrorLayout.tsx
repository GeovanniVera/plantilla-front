/**
 * Layout reutilizable para páginas de error.
 *
 * Estructura: imagen + título + descripción + acciones.
 * Lo que cambia: imagen, título, descripción y acciones.
 *
 * @example
 * ```tsx
 * <ErrorLayout
 *   image="/403.png"
 *   title="Acceso denegado"
 *   description="No tenés permisos para acceder a esta sección."
 *   actions={<Button onClick={() => navigate(-1)}>Volver</Button>}
 * />
 * ```
 */
import type { ReactNode } from 'react';

interface ErrorLayoutProps {
  /** Ruta de la imagen (ej: /403.png) */
  image: string;
  /** Texto alternativo de la imagen */
  imageAlt: string;
  /** Título del error */
  title: string;
  /** Descripción del error */
  description: string;
  /** Acciones (botones) */
  actions?: ReactNode;
  /** Contenido adicional después de la descripción */
  children?: ReactNode;
}

export default function ErrorLayout({
  image,
  imageAlt,
  title,
  description,
  actions,
  children,
}: ErrorLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Imagen */}
        <img src={image} alt={imageAlt} className="mb-8 w-64 object-contain" />

        {/* Título */}
        <h1 className="text-fg mb-2 text-3xl font-bold">{title}</h1>

        {/* Descripción */}
        <p className="text-fg-muted mb-6 text-sm">{description}</p>

        {/* Contenido adicional */}
        {children && <div className="mt-6">{children}</div>}

        {/* Acciones */}
        {actions && <div className="mt-4 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </div>
  );
}
