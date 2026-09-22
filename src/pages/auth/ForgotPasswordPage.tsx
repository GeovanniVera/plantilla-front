/**
 * Página: Olvidé mi contraseña.
 *
 * Primer paso del flujo: ingresa el email.
 * El backend enviará un OTP al correo indicado.
 */
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { LuMail, LuArrowLeft } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import Input from '@components/primitives/Input';
import Spinner from '@components/feedback/Spinner';
import { useForgotPassword as useForgotPasswordContext } from '../../auth/ForgotPasswordContext';
import { useForgotPassword } from '../../hooks/useAuth';
import { AuthFormHeader } from '../../layouts/auth/AuthFormLayout';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setEmail } = useForgotPasswordContext();
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmailLocal] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const emailId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    forgotPasswordMutation.mutate(email, {
      onSuccess: (response) => {
        if (!response.success) {
          setError(response.message || t('errors.unknown'));
          return;
        }
        setEmail(email);
        setSent(true);
        setTimeout(() => {
          navigate('/verify-otp');
        }, 2000);
      },
      onError: () => {
        setError(t('errors.network'));
      },
    });
  };

  if (sent) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-success-bg flex size-16 items-center justify-center rounded-full">
          <svg
            className="text-success size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h2 className="text-fg text-xl font-bold">{t('auth.forgotPassword.successTitle')}</h2>
        <p className="text-fg-muted text-sm">{t('auth.forgotPassword.successMessage')}</p>
        <p className="text-fg-muted text-xs opacity-60">Redirigiendo automáticamente...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-fg-muted hover:text-fg flex items-center gap-2 self-start text-sm transition-colors"
        >
          <LuArrowLeft size={16} />
          {t('auth.forgotPassword.backToLogin')}
        </button>

        {/* Header */}
        <AuthFormHeader
          title={t('auth.forgotPassword.title')}
          subtitle={t('auth.forgotPassword.subtitle')}
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
            <label htmlFor={emailId} className="text-fg block text-sm font-medium">
              {t('auth.forgotPassword.email')}
            </label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={setEmailLocal}
              placeholder="tu@email.com"
              startAdornment={<LuMail size={16} />}
              startAdornmentVariant="accent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="bg-accent hover:bg-accent-hover flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Spinner size="sm" color="white" />
                <span>{t('auth.forgotPassword.submitting')}</span>
              </>
            ) : (
              t('auth.forgotPassword.submit')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
