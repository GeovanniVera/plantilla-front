import { useEffect, useState } from 'react';
import { client } from '../lib/api/client';
import { env } from '../config/env';

/**
 * Convierte una `photoUrl` del backend en la ruta relativa al API base que
 * espera el cliente HTTP.
 *
 * El backend de almacenamiento local genera `http(s)://host/api/files/{key}`.
 * Extraemos `/files/{key}` para que `client.getBlob` le anteponga su `baseUrl`
 * y la request viaje con el JWT por el mismo camino que el resto del API.
 *
 * @param photoUrl - URL absoluta o relativa de la foto
 * @returns Ruta relativa al API (ej: `/files/abc.png`) o `null` si la URL es
 *          externa al backend (p. ej. Cloudinary)
 */
function toApiPath(photoUrl: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(photoUrl, window.location.origin).pathname;
  } catch {
    return null;
  }

  let basePath: string;
  try {
    basePath = new URL(env.VITE_API_BASE, window.location.origin).pathname.replace(/\/+$/, '');
  } catch {
    return null;
  }

  if (!basePath || !pathname.startsWith(`${basePath}/`)) {
    return null;
  }

  return pathname.slice(basePath.length);
}

/**
 * Resuelve una foto protegida a un object URL renderizable en un `<img>`.
 *
 * El access token vive en memoria y un `<img src>` no puede enviar el header
 * `Authorization`; por eso la imagen se descarga con el cliente HTTP (que
 * adjunta el JWT y lo refresca si expiró), se convierte a `Blob` y se usa
 * `URL.createObjectURL`. El object URL se revoca al cambiar o al desmontar.
 *
 * Las URLs externas al API (p. ej. Cloudinary) se devuelven tal cual: no se les
 * filtra el JWT y el backend no las sirve detrás de sesión.
 *
 * @param photoUrl - URL de la foto devuelta por el backend (`photoUrl`)
 * @returns Object URL listo para `<img>`, la URL externa, o `null` si no hay
 *          foto o la descarga falla
 */
export function useAuthenticatedImage(photoUrl?: string | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const apiPath = photoUrl ? toApiPath(photoUrl) : null;

  useEffect(() => {
    if (!photoUrl || !apiPath) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;
    setObjectUrl(null);

    client
      .getBlob(apiPath)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setObjectUrl(null);
          return;
        }
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(null);
      });

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [photoUrl, apiPath]);

  // URL externa: se usa directamente (sin pasar por el fetch autenticado).
  if (photoUrl && !apiPath) {
    return photoUrl;
  }

  return objectUrl;
}
