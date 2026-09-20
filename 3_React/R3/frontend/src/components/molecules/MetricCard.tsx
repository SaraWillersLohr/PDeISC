/** tarjeta de métrica — usada en la fila superior del dashboard */
import type { ReactNode } from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'alert' | 'info';
}

export function MetricCard({ title, value, subtitle, icon, variant = 'default' }: MetricCardProps) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </article>
  );
}
