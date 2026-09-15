/**
 * Página: Restablecer contraseña.
 *
 * Tercer paso del flujo: ingresa la nueva contraseña.
 * Requiere token válido del paso anterior.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LuLock, LuArrowLeft, LuCheck } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import Input from '@components/primitives/Input';
import Spinner from '@components/feedback/Spinner';
import { useForgotPassword } from '../../auth/ForgotPasswordContext';
import { AuthFormHeader } from '../../layouts/auth/AuthFormLayout';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email, token, resetPassword, reset } = useForgotPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirigir si no hay token
  if (!token && !success) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    const result = await resetPassword(password);

    if (result.success) {
      setSuccess(true);
      reset(); // Limpiar estado
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Error al cambiar la contraseña');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-success-bg flex size-16 items-center justify-center rounded-full">
          <LuCheck size={32} className="text-success" />
        </div>
        <h2 className="text-fg text-xl font-bold">{t('auth.resetPassword.successTitle')}</h2>
        <p className="text-fg-muted text-sm">{t('auth.resetPassword.successMessage')}</p>
        <p className="text-fg-muted text-xs opacity-60">Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/verify-otp')}
          className="text-fg-muted hover:text-fg flex items-center gap-2 self-start text-sm transition-colors"
        >
          <LuArrowLeft size={16} />
          {t('auth.resetPassword.backToLogin')}
        </button>

        {/* Header */}
        <AuthFormHeader
          title={t('auth.resetPassword.title')}
          subtitle={t('auth.resetPassword.subtitle', { email })}
        />

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-fg block text-sm font-medium">
              {t('auth.resetPassword.password')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t('auth.resetPassword.passwordPlaceholder')}
              startAdornment={<LuLock size={16} />}
              startAdornmentVariant="accent"
              showPasswordToggle
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-fg block text-sm font-medium">
              {t('auth.resetPassword.confirmPassword')}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
              startAdornment={<LuLock size={16} />}
              startAdornmentVariant="accent"
              showPasswordToggle
              autoComplete="new-password"
              required
            />
          </div>

          {/* Password requirements */}
          <div className="bg-surface text-fg-muted rounded-lg p-3 text-xs">
            <p className="text-fg mb-1 font-medium">La contraseña debe:</p>
            <ul className="space-y-1">
              <li className={password.length >= 6 ? 'text-success' : ''}>
                • Tener al menos 6 caracteres
              </li>
              <li className={password === confirmPassword && password ? 'text-success' : ''}>
                • Coinfirmar con la contraseña
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent-hover flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" />
                <span>{t('auth.resetPassword.submitting')}</span>
              </>
            ) : (
              t('auth.resetPassword.submit')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
