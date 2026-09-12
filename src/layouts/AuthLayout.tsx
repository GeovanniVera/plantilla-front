/**
 * Layout de autenticación: hero animado (izquierda) + form (derecha).
 *
 * Mobile: solo se muestra el form.
 * Desktop: split 50/50 con hero animado usando colores del tema.
 *
 * Flujo visual: el usuario ve primero el hero (izquierda) con la marca,
 * luego baja la mirada al form (derecha) para completar la acción.
 */
import { Outlet, Link } from 'react-router';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.splitLayout}>
      {/* Panel izquierdo: Hero animado + branding */}
      <div className={styles.leftPanel}>
        <div className={styles.heroBg}>
          {/* Capas de gradientes estáticos */}
          <div className={`${styles.gradientLayer} ${styles.gradient1}`} />
          <div className={`${styles.gradientLayer} ${styles.gradient2}`} />
          <div className={`${styles.gradientLayer} ${styles.gradient3}`} />

          {/* Iconos flotantes */}
          <div className={`${styles.floatingIcon} ${styles.icon1}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div className={`${styles.floatingIcon} ${styles.icon2}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div className={`${styles.floatingIcon} ${styles.icon3}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div className={`${styles.floatingIcon} ${styles.icon4}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <div className={`${styles.floatingIcon} ${styles.icon5}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
        </div>

        {/* Branding centrado sobre el hero */}
        <div className={styles.heroContent}>
          <Link to="/" className={styles.heroBrand}>
            <img src="/logo.svg" alt="SemillaTecnologica" className={styles.heroLogo} />
            <span className={styles.heroBrandName}>SemillaTecnologica</span>
          </Link>
          <h2 className={styles.heroTitle}>
            La plataforma que necesitás para gestionar tu negocio.
          </h2>
          <p className={styles.heroDesc}>
            Simplificá tus procesos, aumentá tu productividad y tomá mejores decisiones con nuestras
            herramientas.
          </p>
        </div>
      </div>

      {/* Panel derecho: Formulario */}
      <div className={styles.rightPanel}>
        <div className={styles.brandMobile}>
          <Link to="/" className={styles.brandMobileLink}>
            <img src="/logo.svg" alt="SemillaTecnologica" className={styles.brandLogoMobile} />
            <span className={styles.brandNameMobile}>SemillaTecnologica</span>
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
