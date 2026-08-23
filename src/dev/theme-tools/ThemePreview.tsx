import styles from './ThemePreview.module.css'

export default function ThemePreview() {
    return (
        <div className={styles.panel}>
            <h3 className={styles.heading}>Vista previa en vivo</h3>
            <p className={styles.subtext}>Los colores se actualizan automáticamente al cambiar el tema.</p>

            <div className={styles.card}>
                <span className={styles.eyebrow}>Nuevo producto</span>
                <h4 className={styles.title}>Tarjeta de presentación</h4>
                <p className={styles.paragraph}>
                    Este es un ejemplo de cómo se vería el contenido con los colores actuales de tu marca.
                </p>

                <div className={styles.actions}>
                    <button className={styles.btnPrimary}>Botón primario</button>
                    <button className={styles.btnSecondary}>Botón secundario</button>
                </div>

                <div className={styles.extras}>
                    <span className={styles.badge}>Badge</span>
                    <input
                        type="text"
                        placeholder="Input de texto"
                        className={styles.input}
                        readOnly
                    />
                </div>
            </div>
        </div>
    )
}
