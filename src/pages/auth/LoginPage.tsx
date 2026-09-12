import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { LuMail, LuLock, LuCircleAlert } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import { GuestOnly } from '../../auth/guards';
import Input from '@components/primitives/Input';
import {
  AuthFormHeader,
  AuthFormCheckbox,
  AuthFormActions,
} from '../../layouts/auth/AuthFormLayout';

/**
 * Página de inicio de sesión.
 *
 * Formulario plano con inputs del design system.
 *
 * Cuentas de prueba:
 * - admin@test.com / admin123
 * - editor@test.com / editor123
 * - viewer@test.com / viewer123
 */
function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Header */}
        <AuthFormHeader title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

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
            <label className="text-fg block text-sm font-medium">{t('auth.login.email')}</label>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={t('auth.login.emailPlaceholder')}
              startAdornment={<LuMail size={16} />}
              startAdornmentVariant="accent"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-fg block text-sm font-medium">{t('auth.login.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t('auth.login.passwordPlaceholder')}
              startAdornment={<LuLock size={16} />}
              startAdornmentVariant="accent"
              showPasswordToggle
              autoComplete="current-password"
              required
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-accent text-xs hover:underline">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          </div>

          <AuthFormCheckbox label="Recordarme" checked={remember} onChange={setRemember} />

          {/* Actions */}
          <AuthFormActions
            submitLabel={t('auth.login.submit')}
            loading={loading}
            secondaryLabel={`${t('auth.login.noAccount')} ${t('auth.login.register')}`}
            secondaryHref="/register"
          />
        </form>

      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <GuestOnly>
      <LoginPage />
    </GuestOnly>
  );
}
