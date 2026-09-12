/**
 * Página de Términos y Condiciones.
 *
 * Documento legal básico para plantilla.
 * El developer debe personalizar según el caso de uso.
 */
import { Link } from 'react-router';
import { LuArrowLeft } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';

const SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    content: `Al acceder y utilizar esta aplicación, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de los términos, no debe utilizar la aplicación.`,
  },
  {
    title: '2. Uso de la Aplicación',
    content: `Esta aplicación le permite acceder a servicios de gestión y productividad. Usted se compromete a utilizar la aplicación de manera lícita y de acuerdo con estos términos. Queda prohibido:
• Utilizar la aplicación para fines ilegales o no autorizados
• Interferir con el funcionamiento de la aplicación
• Acceder a cuentas de otros usuarios sin autorización
• Distribuir contenido malicioso o dañino`,
  },
  {
    title: '3. Cuenta de Usuario',
    content: `Para acceder a ciertas funcionalidades, deberá crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de:
• Mantener la confidencialidad de sus credenciales
• Todas las actividades que ocurran en su cuenta
• Notificar inmediatamente cualquier uso no autorizado`,
  },
  {
    title: '4. Propiedad Intelectual',
    content: `Todos los contenidos, diseños, logos y marcas presentes en esta aplicación son propiedad de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización.`,
  },
  {
    title: '5. Limitación de Responsabilidad',
    content: `La aplicación se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables por:
• Daños indirectos o consecuentes
• Pérdida de datos o interrupciones del servicio
• Errores o inexactitudes en el contenido
• Decisiones tomadas basándose en la información de la aplicación`,
  },
  {
    title: '6. Privacidad',
    content: `Su uso de la aplicación también está regido por nuestra Política de Privacidad, que describe cómo recopilamos, usamos y protegemos su información personal. Al utilizar la aplicación, usted consiente las prácticas descritas en dicha política.`,
  },
  {
    title: '7. Modificaciones',
    content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación. El uso continuado de la aplicación después de los cambios constituye la aceptación de los nuevos términos.`,
  },
  {
    title: '8. Terminación',
    content: `Podemos suspender o终止 su acceso a la aplicación en cualquier momento, sin previo aviso, por conducta que consideremos violadora de estos términos o perjudicial para otros usuarios.`,
  },
  {
    title: '9. Legislación Aplicable',
    content: `Estos términos se rigen por las leyes de la jurisdicción correspondiente. Cualquier disputa será resuelta ante los tribunales competentes de dicha jurisdicción.`,
  },
  {
    title: '10. Contacto',
    content: `Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de los canales oficiales de la aplicación.`,
  },
];

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border-base bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link
            to="/register"
            className="text-fg-muted hover:text-fg flex items-center gap-2 text-sm transition-colors"
          >
            <LuArrowLeft size={16} />
            {t('auth.resetPassword.backToLogin')}
          </Link>
          <h1 className="text-fg text-lg font-bold">{t('pages.terms.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Intro */}
        <div className="border-border-base bg-surface mb-8 rounded-xl border p-6">
          <p className="text-fg-muted text-sm leading-relaxed">
            <strong className="text-fg">{t('pages.terms.lastUpdated')}</strong>
          </p>
          <p className="text-fg-muted mt-2 text-sm leading-relaxed">
            Estos Términos y Condiciones rigen el uso de esta aplicación. Al utilizar nuestros
            servicios, usted acepta estos términos en su totalidad.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, index) => (
            <section
              key={index}
              className="border-border-base bg-background hover:border-accent-line rounded-xl border p-6 transition-colors"
            >
              <h2 className="text-fg mb-3 text-base font-semibold">{section.title}</h2>
              <div className="text-fg-muted text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="border-accent/20 bg-accent/5 mt-8 rounded-xl border p-6">
          <p className="text-fg-muted text-center text-sm">
            Al crear una cuenta o utilizar esta aplicación, usted confirma que ha leído y aceptado
            estos{' '}
            <Link to="/terms" className="text-accent font-medium hover:underline">
              Términos y Condiciones
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
