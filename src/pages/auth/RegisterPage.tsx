/**
 * Página de registro.
 *
 * Formulario plano con inputs del design system.
 * Campos: nombre, email, contraseña, aceptar términos.
 * Post-registro: auto-login y redirección a "verifica tu email".
 */
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { LuMail, LuLock, LuCircleAlert, LuUser } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { GuestOnly } from '../../auth/guards';
import { useAuth } from '../../auth';
import { useRegister } from '../../hooks/useAuth';
import Input from '@components/primitives/Input';
import Checkbox from '@components/primitives/Checkbox';
import { PasswordRequirements } from '@components/forms';
import { validatePassword } from '@lib/validation/password';
import { AuthFormHeader, AuthFormActions } from '../../layouts/auth/AuthFormLayout';

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError('Debés aceptar los términos y condiciones');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(t(passwordError));
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    registerMutation.mutate(
      { name, email, password, acceptedTerms: acceptTerms },
      {
        onSuccess: async (response) => {
          // El cliente resuelve { success: false } en vez de rechazar en errores
          // HTTP (ej: 409 email duplicado): discriminar antes de navegar.
          if (!response.success) {
            setError(response.message || t('errors.unknown'));
            return;
          }
          // El backend ahora emite sesión para cuentas sin verificar (autoridad
          // UNVERIFIED), así que hacemos auto-login: el guard RequireUnverified
          // deja ver /verify-email a un usuario autenticado sin verificar.
          try {
            await login(email, password);
            navigate('/verify-email', { state: { email } });
          } catch {
            // El registro se completó pero falló el login automático: pedir
            // login manual (que ahora sí funciona para cuentas sin verificar).
            navigate('/login', { replace: true });
          }
        },
        onError: (err) => setError(err.message || t('errors.unknown')),
      },
    );
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Header */}
        <AuthFormHeader title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} />

        {/* Error */}
        {error && (
          <div className="border-danger-line bg-danger-bg text-danger-strong flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <LuCircleAlert size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor={nameId} className="text-fg block text-sm font-medium">
              {t('auth.register.name')}
            </label>
            <Input
              id={nameId}
              type="text"
              value={name}
              onChange={setName}
              placeholder={t('auth.register.namePlaceholder')}
              startAdornment={<LuUser size={16} />}
              startAdornmentVariant="accent"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={emailId} className="text-fg block text-sm font-medium">
              {t('auth.register.email')}
            </label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@email.com"
              startAdornment={<LuMail size={16} />}
              startAdornmentVariant="accent"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={passwordId} className="text-fg block text-sm font-medium">
              {t('auth.register.password')}
            </label>
            <Input
              id={passwordId}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t('auth.register.passwordPlaceholder')}
              startAdornment={<LuLock size={16} />}
              startAdornmentVariant="accent"
              showPasswordToggle
              autoComplete="new-password"
              required
            />
          </div>

          {/* Requisitos de la contraseña */}
          <PasswordRequirements value={password} />

          <div className="space-y-1.5">
            <label htmlFor={confirmPasswordId} className="text-fg block text-sm font-medium">
              {t('auth.register.confirmPassword')}
            </label>
            <Input
              id={confirmPasswordId}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              startAdornment={<LuLock size={16} />}
              startAdornmentVariant="accent"
              showPasswordToggle
              autoComplete="new-password"
              required
            />
          </div>

          {/* Términos */}
          <div className="flex items-start gap-3">
            <Checkbox checked={acceptTerms} onChange={setAcceptTerms} className="mt-0.5" />
            <span className="text-fg-muted text-sm">
              {t('auth.register.termsPrefix')}{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {t('auth.register.terms')}
              </a>
            </span>
          </div>

          {/* Actions */}
          <AuthFormActions
            submitLabel={t('auth.register.submit')}
            loading={registerMutation.isPending}
            secondaryLabel={`${t('auth.register.hasAccount')} ${t('auth.register.login')}`}
            secondaryHref="/login"
          />
        </form>
      </div>
    </div>
  );
}

export default function RegisterPageWrapper() {
  return (
    <GuestOnly>
      <RegisterPage />
    </GuestOnly>
  );
}
