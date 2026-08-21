import styles from './Componentes.module.css'
import CategorySection from '../components/ui/CategorySection'
import { cardVariants } from './components-data'

export default function ComponentesCards() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Cards</h1>
            <p className={styles.subtitle}>
                Tarjetas para contenido agrupado con variantes de header.
            </p>

            <CategorySection
                title="Variantes"
                description="Tipos de tarjetas disponibles."
                variants={cardVariants}
            />
        </div>
    )
}
