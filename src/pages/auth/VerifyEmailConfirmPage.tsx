/**
 * Página: Confirmar verificación de email.
 *
 * Se accede desde el enlace enviado al email.
 * Valida el token y muestra el resultado.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { LuCheck, LuX } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { authService } from '../../lib/api/services/auth.service';
import Spinner from '@components/feedback/Spinner';

export default function VerifyEmailConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setError('Token de verificación no proporcionado');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (response.success) {
          setStatus('success');
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (response.code === 'NETWORK_ERROR' || response.code === 'TIMEOUT') {
          setStatus('error');
          setError('Error al verificar el email');
        } else {
          setStatus('error');
          setError('Token inválido o expirado');
        }
      } catch {
        setStatus('error');
        setError('Error al verificar el email');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Loading */}
      {status === 'loading' && (
        <>
          <div className="bg-accent-subtle flex size-16 items-center justify-center rounded-full">
            <Spinner size="lg" />
          </div>
          <h2 className="text-fg text-xl font-bold">{t('auth.verifyEmail.title')}</h2>
          <p className="text-fg-muted text-sm">{t('auth.verifyEmail.subtitle')}</p>
        </>
      )}

      {/* Success */}
      {status === 'success' && (
        <>
          <div className="bg-success-bg flex size-16 items-center justify-center rounded-full">
            <LuCheck size={32} className="text-success" />
          </div>
          <h2 className="text-fg text-xl font-bold">{t('auth.verifyEmail.successTitle')}</h2>
          <p className="text-fg-muted text-sm">{t('auth.verifyEmail.successMessage')}</p>
          <p className="text-fg-muted text-xs opacity-60">Redirigiendo al login...</p>
        </>
      )}

      {/* Error */}
      {status === 'error' && (
        <>
          <div className="bg-danger-bg flex size-16 items-center justify-center rounded-full">
            <LuX size={32} className="text-danger" />
          </div>
          <h2 className="text-fg text-xl font-bold">{t('errors.unknown')}</h2>
          <p className="text-fg-muted text-sm">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-accent hover:bg-accent-hover mt-4 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
          >
            {t('auth.login.backToLogin')}
          </button>
        </>
      )}
    </div>
  );
}
