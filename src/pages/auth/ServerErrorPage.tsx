/**
 * Página de error del servidor (500).
 *
 * Diseño diferente: tonos rojos, fondo más opaco,
 * para reflejar la gravedad del error.
 */
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function ServerErrorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          maxWidth: 400,
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Imagen */}
        <img
          src="/500.png"
          alt={t('pages.serverError.title')}
          style={{ marginBottom: 32, width: 288, objectFit: 'contain' }}
        />

        {/* Título */}
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 30,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {t('pages.serverError.title')}
        </h1>

        {/* Descripción */}
        <p
          style={{
            margin: '0 0 48px',
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(220, 38, 38, 0.8)',
          }}
        >
          {t('pages.serverError.message')}
        </p>

        {/* Acciones */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('common.back')}
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid rgba(220, 38, 38, 0.3)',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('pages.serverError.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
