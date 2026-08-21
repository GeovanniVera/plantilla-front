import { Outlet } from 'react-router'
import Sidebar from '../components/sidebar/Sidebar'
import styles from './MainLayout.module.css'

export default function MainLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    )
}