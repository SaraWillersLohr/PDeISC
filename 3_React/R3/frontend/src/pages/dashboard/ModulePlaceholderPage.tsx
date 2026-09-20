/** placeholder de módulos — se implementan en fase 5 */
import styles from './ModulePlaceholderPage.module.css';

interface Props {
  title: string;
  fase?: number;
}

export function ModulePlaceholderPage({ title, fase = 5 }: Props) {
  return (
    <div className={styles.page}>
      <h1>{title}</h1>
      <p>módulo completo en fase {fase}</p>
    </div>
  );
}
