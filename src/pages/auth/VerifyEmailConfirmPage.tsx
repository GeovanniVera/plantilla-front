/**
 * Página: Confirmar verificación de email.
 *
 * Se accede desde el enlace enviado al email.
 * Valida el token y muestra el resultado.
 */
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { LuCheck, LuX } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useVerifyEmail } from '../../hooks/useAuth';
import Spinner from '@components/feedback/Spinner';

export default function VerifyEmailConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const hasCalled = useRef(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token || hasCalled.current) return;
    hasCalled.current = true;
    verifyEmailMutation.mutate(token);
  }, [token, verifyEmailMutation]);

  // Redirigir a login después de verificación exitosa
  useEffect(() => {
    if (verifyEmailMutation.isSuccess) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [verifyEmailMutation.isSuccess, navigate]);

  // Error: no token provided
  if (!token) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="bg-danger-bg flex size-16 items-center justify-center rounded-full">
          <LuX size={32} className="text-danger" />
        </div>
        <h2 className="text-fg text-xl font-bold">{t('errors.unknown')}</h2>
        <p className="text-fg-muted text-sm">Token de verificación no proporcionado</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="bg-accent hover:bg-accent-hover mt-4 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
        >
          {t('auth.login.backToLogin')}
        </button>
      </div>
    );
  }

  // Loading
  if (verifyEmailMutation.isPending) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="bg-accent-subtle flex size-16 items-center justify-center rounded-full">
          <Spinner size="lg" />
        </div>
        <h2 className="text-fg text-xl font-bold">{t('auth.verifyEmail.title')}</h2>
        <p className="text-fg-muted text-sm">{t('auth.verifyEmail.subtitle')}</p>
      </div>
    );
  }

  // Error: el cliente resuelve { success: false } en vez de rechazar en errores
  // HTTP o de red; `mutation.error` nunca se setea.
  if (verifyEmailMutation.data?.success === false) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="bg-danger-bg flex size-16 items-center justify-center rounded-full">
          <LuX size={32} className="text-danger" />
        </div>
        <h2 className="text-fg text-xl font-bold">{t('errors.unknown')}</h2>
        <p className="text-fg-muted text-sm">
          {verifyEmailMutation.data.message || 'Error al verificar el email'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="bg-accent hover:bg-accent-hover mt-4 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
        >
          {t('auth.login.backToLogin')}
        </button>
      </div>
    );
  }

  // Success
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="bg-success-bg flex size-16 items-center justify-center rounded-full">
        <LuCheck size={32} className="text-success" />
      </div>
      <h2 className="text-fg text-xl font-bold">{t('auth.verifyEmail.successTitle')}</h2>
      <p className="text-fg-muted text-sm">{t('auth.verifyEmail.successMessage')}</p>
      <p className="text-fg-muted text-xs opacity-60">Redirigiendo al login...</p>
    </div>
  );
}
