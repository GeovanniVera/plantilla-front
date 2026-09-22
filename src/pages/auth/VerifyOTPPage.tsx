/**
 * Página: Verificar código OTP.
 *
 * Segundo paso del flujo: ingresa el código de 6 dígitos.
 * El OTP está ligado a un token para el siguiente paso.
 */
import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { LuArrowLeft, LuShield } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import Spinner from '@components/feedback/Spinner';
import { useForgotPassword } from '../../auth/ForgotPasswordContext';
import { usePasswordPolicy } from '../../hooks/useAuth';
import { AuthFormHeader } from '../../layouts/auth/AuthFormLayout';

export default function VerifyOTPPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email, verifyOtp } = useForgotPassword();
  const { data: passwordPolicy } = usePasswordPolicy();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirigir declarativamente si no hay email: navegar durante el render es un
  // efecto ilegal (doble disparo bajo StrictMode) y no impide el render.
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Solo último dígito
    setOtp(newOtp);
    setError('');

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando esté completo
    if (newOtp.every((digit) => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (otpString: string) => {
    setLoading(true);
    setError('');

    const result = await verifyOtp(otpString);

    if (result.success) {
      navigate('/reset-password');
    } else {
      setError(result.error || 'Código inválido');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-fg-muted hover:text-fg flex items-center gap-2 self-start text-sm transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver
        </button>

        {/* Header */}
        <AuthFormHeader
          title={t('auth.verifyOTP.title')}
          subtitle={t('auth.verifyOTP.subtitle', { email })}
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

        {/* OTP Input */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              className="border-border-base bg-background text-fg focus:border-accent focus:ring-accent/20 size-12 rounded-lg border text-center text-lg font-bold transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              aria-label={`Dígito ${index + 1}`}
            />
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-fg-muted flex items-center justify-center gap-2 text-sm">
            <Spinner size="sm" />
            <span>{t('auth.verifyOTP.submitting')}</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-surface text-fg-muted flex items-center justify-center gap-2 rounded-lg p-4 text-sm">
          <LuShield size={16} className="text-accent shrink-0" />
          <span>
            {passwordPolicy
              ? t('auth.verifyOTP.expiresIn', { minutes: passwordPolicy.otpExpiresInMinutes })
              : t('auth.verifyOTP.expiresFallback')}
          </span>
        </div>
      </div>
    </div>
  );
}
