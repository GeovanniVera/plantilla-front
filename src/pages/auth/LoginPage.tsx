import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router';
import { LuMail, LuLock, LuCircleAlert } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/useAuth';
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
 */
function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
  const suspendedMessage = searchParams.get('error');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password, remember },
      {
        // Un usuario sin verificar inicia sesión correctamente (el backend ya no
        // rechaza ese login). `from` apunta a /dashboard y ProtectedRoute lo
        // redirige a /verify-email al no estar verificado: no hace falta un
        // branch de error para ese caso.
        onSuccess: () => navigate(from, { replace: true }),
      },
    );
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Header */}
        <AuthFormHeader title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

        {/* Error de suspensión (desde query param) */}
        {suspendedMessage && (
          <div className="border-danger-line bg-danger-bg text-danger-strong flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <LuCircleAlert size={16} className="shrink-0" />
            {suspendedMessage}
          </div>
        )}

        {/* Error del formulario */}
        {loginMutation.error && (
          <div className="border-danger-line bg-danger-bg text-danger-strong flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <LuCircleAlert size={16} className="shrink-0" />
            {loginMutation.error.message || t('errors.unknown')}
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
            loading={loginMutation.isPending}
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
