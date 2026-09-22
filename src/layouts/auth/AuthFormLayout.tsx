/**
 * Layout de formulario de autenticación.
 *
 * Estructura plana sin tarjetas ni recuadros.
 *
 * Componentes:
 * - AuthFormHeader: título con indicador de estado activo
 * - AuthFormCheckbox: checkbox del design system
 * - AuthFormActions: botón CTA + enlace secundario
 */
import { Link } from 'react-router';
import Checkbox from '@components/primitives/Checkbox';
import Spinner from '@components/feedback/Spinner';

/* ─── Header ────────────────────────────────────────────── */
interface AuthFormHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-fg text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-fg-muted text-sm">{subtitle}</p>}
    </div>
  );
}

/* ─── Checkbox ──────────────────────────────────────────── */
interface AuthFormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AuthFormCheckbox({ label, checked, onChange }: AuthFormCheckboxProps) {
  return <Checkbox label={label} checked={checked} onChange={onChange} />;
}

/* ─── Actions (Botón + Enlace) ──────────────────────────── */
interface AuthFormActionsProps {
  submitLabel: string;
  loading?: boolean;
  secondaryLabel: string;
  secondaryHref: string;
}

export function AuthFormActions({
  submitLabel,
  loading = false,
  secondaryLabel,
  secondaryHref,
}: AuthFormActionsProps) {
  return (
    <div className="space-y-4">
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-hover flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-[background-color,transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="white" />
            <span>Cargando...</span>
          </>
        ) : (
          submitLabel
        )}
      </button>
      <p className="text-fg-muted text-center text-sm">
        {secondaryLabel.split(/(¿.*\?)/g).map((part, i) =>
          part.match(/¿.*\?/) ? (
            <Link key={i} to={secondaryHref} className="text-accent font-medium hover:underline">
              {part}
            </Link>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
    </div>
  );
}
