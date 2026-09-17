/**
 * Página de no encontrado (404).
 */
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Button from '@components/primitives/Button';
import ErrorLayout from '../../layouts/ErrorLayout';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ErrorLayout
      image="/404.png"
      imageAlt={t('pages.notFound.title')}
      title={t('pages.notFound.title')}
      description={t('pages.notFound.message')}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          {t('pages.notFound.backToHome')}
        </Button>
      </div>
    </ErrorLayout>
  );
}
