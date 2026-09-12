/**
 * Página de acceso denegado (403).
 *
 * Se muestra cuando el usuario está autenticado pero no tiene
 * permisos para acceder a la ruta solicitada.
 */
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import Button from '@components/primitives/Button';
import ErrorLayout from '../../layouts/ErrorLayout';

export default function ForbiddenPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <ErrorLayout
      image="/403.png"
      imageAlt={t('pages.forbidden.title')}
      title={t('pages.forbidden.title')}
      description={t('pages.forbidden.message')}
    >
      {/* Info del usuario */}
      {user && (
        <div className="border-border-base bg-surface mb-8 rounded-lg border px-4 py-3">
          <p className="text-fg-muted text-xs">
            Conectado como <span className="text-fg font-medium">{user.email}</span> con roles{' '}
            <span className="text-fg font-medium">[{user.roles.join(', ')}]</span>
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>

        <Button variant="secondary" onClick={() => navigate('/')}>
          {t('pages.forbidden.backToHome')}
        </Button>

        <Button
          variant="danger"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </ErrorLayout>
  );
}
