import styles from './Componentes.module.css'
import CategorySection from '../components/ui/CategorySection'
import { cardVariants } from './components-data'

export default function ComponentesCards() {
    return (
        <div className={styles.page}>
            <CategorySection
                title="Variantes"
                description="Tipos de tarjetas disponibles."
                variants={cardVariants}
            />
        </div>
    )
}
