/**
 * Checklist de requisitos de contraseña con estado en vivo.
 *
 * Renderiza la política compartida (`PASSWORD_REQUIREMENTS`) y marca cada fila
 * como cumplida/no cumplida según el `value` actual. Reutilizable por cualquier
 * formulario donde se cree o cambie contraseña.
 */
import { useTranslation } from 'react-i18next';
import { PASSWORD_REQUIREMENTS } from '@lib/validation/password';

export interface PasswordRequirementsProps {
  /** Valor actual del campo de contraseña. */
  value: string;
}

export default function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface text-fg-muted rounded-lg p-3 text-xs">
      <p className="text-fg mb-1 font-medium">{t('auth.passwordPolicy.title')}</p>
      <ul className="space-y-1">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const passed = requirement.test(value);
          return (
            <li
              key={requirement.id}
              data-testid={`password-requirement-${requirement.id}`}
              data-passed={passed}
              className={passed ? 'text-success' : ''}
            >
              • {t(requirement.translationKey)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
