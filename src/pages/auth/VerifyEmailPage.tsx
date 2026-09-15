/**
 * Página: Verificar email.
 *
 * Muestra después del registro o cuando el usuario intenta acceder
 * con una cuenta no verificada.
 *
 * Muestra:
 * - Instrucciones para verificar el email
 * - Botón para reenviar email
 * - Botón para cerrar sesión
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LuMail, LuLogOut } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import Spinner from '@components/feedback/Spinner';
import { authService } from '../../lib/api/services/auth.service';
import { AuthFormHeader } from '../../layouts/auth/AuthFormLayout';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Email del usuario o del state (post-registration)
  const email = user?.email || (location.state as { email?: string })?.email || '';

  const handleResend = async () => {
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.resendVerification(email);
      if (!response.success) {
        setError('Error al reenviar el email. Intentá de nuevo.');
        return;
      }
      setSent(true);
      console.log('[Mock] Email de verificación reenviado a:', email);
      console.log('[Mock] Token de verificación: verify-token-abc123');
    } catch {
      setError('Error al reenviar el email. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Header */}
        <AuthFormHeader
          title={t('auth.verifyEmail.title')}
          subtitle={t('auth.verifyEmail.subtitle')}
        />

        {/* Email info */}
        <div className="bg-surface flex items-center gap-3 rounded-lg p-4">
          <div className="bg-accent-subtle flex size-10 items-center justify-center rounded-lg">
            <LuMail size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-fg text-sm font-medium">{email}</p>
            <p className="text-fg-muted text-xs">{t('auth.verifyEmail.successMessage')}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="border-danger-line bg-danger-bg text-danger-strong flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Success message */}
        {sent && (
          <div className="border-success-line bg-success-bg text-success-strong flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Email reenviado exitosamente
          </div>
        )}

        {/* Instructions */}
        <div className="text-fg-muted space-y-3 text-sm">
          <p>Hacé clic en el enlace que te enviamos para verificar tu cuenta.</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Revisá tu bandeja de entrada</li>
            <li>Revisá la carpeta de spam</li>
            <li>El enlace expira en 24 horas</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="bg-accent hover:bg-accent-hover flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" />
                <span>{t('auth.verifyEmail.submitting')}</span>
              </>
            ) : (
              t('auth.verifyEmail.submit')
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="border-border-base bg-background text-fg hover:border-fg-muted hover:bg-surface flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <LuLogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
