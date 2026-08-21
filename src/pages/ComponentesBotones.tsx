import styles from './Componentes.module.css'
import CategorySection from '../components/ui/CategorySection'
import { buttonVariants } from './components-data'

export default function ComponentesBotones() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Botones</h1>
            <p className={styles.subtitle}>
                Botones y etiquetas con variantes de estilo y tamaño.
            </p>

            <CategorySection
                title="Variantes"
                description="Estilos disponibles para botones y badges."
                variants={buttonVariants}
            />
        </div>
    )
}
