// gr�fico de barras apiladas � resumen del campo por especie
import type { DashboardSummary } from '@/types';
import styles from './FieldSummaryChart.module.css';

interface Props {
  data: DashboardSummary['resumenMensual'];
}

// ejecuto fieldsummarychart
export function FieldSummaryChart({ data }: Props) {
  const max = Math.max(
    ...data.map((d) => d.bovinos + d.ovinos + d.equinos),
    1,
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        <span><i className={styles.bovino} /> Bovinos</span>
        <span><i className={styles.ovino} /> Ovinos</span>
        <span><i className={styles.equino} /> Equinos</span>
      </div>
      <div className={styles.chart}>
        {data.map((d) => {
          const total = d.bovinos + d.ovinos + d.equinos;
          const h = (total / max) * 100;
          return (
            <div key={d.mes} className={styles.col}>
              <div className={styles.bar} style={{ height: `${h}%` }}>
                <div className={styles.bovino} style={{ flex: d.bovinos }} />
                <div className={styles.ovino} style={{ flex: d.ovinos }} />
                <div className={styles.equino} style={{ flex: d.equinos }} />
              </div>
              <span className={styles.label}>{d.mes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

