/** layout principal del dashboard  sidebar + contenido */
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/organisms/Sidebar';
import styles from './MainLayout.module.css';

// ejecuto mainlayout
export function MainLayout() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

