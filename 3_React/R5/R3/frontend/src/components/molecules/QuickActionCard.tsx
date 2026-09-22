// tarjeta de acceso r�pido � m�dulos del dashboard
import type { ReactNode } from 'react';
import styles from './QuickActionCard.module.css';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

// ejecuto quickactioncard
export function QuickActionCard({ title, description, icon, onClick }: Props) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </button>
  );
}

