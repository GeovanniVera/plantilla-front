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
import { PasswordRequirements } from '@components/forms';
import Spinner from '@components/feedback/Spinner';
import { validatePassword } from '@lib/validation/password';
import { useForgotPassword } from '../../auth/ForgotPasswordContext';
import { useResetPassword } from '../../hooks/useAuth';
import { AuthFormHeader } from '../../layouts/auth/AuthFormLayout';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email, token, reset } = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirigir si no hay token
  if (!token && !success) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(t(passwordError));
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) return;

    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: (response) => {
          if (response.success) {
            setSuccess(true);
            reset();
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            setError(response.message || 'Error al cambiar la contraseña');
          }
        },
        onError: (err) => {
          setError(err.message || 'Error al cambiar la contraseña');
        },
      },
    );
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
          <PasswordRequirements value={password} />

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="bg-accent hover:bg-accent-hover flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {resetPasswordMutation.isPending ? (
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
