import { useTheme } from '@theme/useTheme';
import { defaultTokens, type TokenKey } from '@theme/tokens';
import ThemePreview from './ThemePreview';
import ContrastChecker from './ContrastChecker';
import styles from './BrandColorSettings.module.css';

const tokenLabels: Record<TokenKey, string> = {
  primary: 'Primario',
  secondary: 'Secundario',
  accent: 'Acento',
  background: 'Fondo',
  surface: 'Superficie',
  text: 'Texto',
  'text-h': 'Texto (títulos)',
  border: 'Borde',
};

export default function BrandColorSettings() {
  const { tokens, setColor, resetTheme } = useTheme();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Colores de marca</h2>
        <button className={styles.resetBtn} onClick={resetTheme}>
          Restaurar valores por defecto
        </button>
      </div>

      <p className={styles.description}>
        Personaliza los colores de tu aplicación. Los cambios se aplican en vivo y se guardan
        automáticamente.
      </p>

      <div className={styles.grid}>
        {(Object.keys(defaultTokens) as TokenKey[]).map((key) => (
          <div key={key} className={styles.row}>
            <label className={styles.label} htmlFor={`color-${key}`}>
              {tokenLabels[key]}
            </label>
            <div className={styles.inputGroup}>
              <input
                id={`color-${key}`}
                type="color"
                value={tokens[key]}
                onChange={(e) => setColor(key, e.target.value)}
                className={styles.colorPicker}
                aria-label={`Color ${tokenLabels[key]}`}
              />
              <input
                type="text"
                value={tokens[key]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    setColor(key, val);
                  }
                }}
                className={styles.hexInput}
                maxLength={7}
                spellCheck={false}
                aria-label={`Hex ${tokenLabels[key]}`}
              />
            </div>
          </div>
        ))}
      </div>

      <ThemePreview />
      <ContrastChecker />
    </div>
  );
}
