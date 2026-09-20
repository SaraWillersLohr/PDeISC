/** servicio de métricas del dashboard — consultas agregadas a mariaDB */
import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface DashboardSummary {
  totalAnimales: number;
  variacionMes: number;
  alertasActivas: number;
  alertasSanitarias: number;
  alertasReproductivas: number;
  corralesTotal: number;
  corralesEnUso: number;
  corralesLibres: number;
  clima: { temperatura: number; descripcion: string };
  resumenMensual: { mes: string; bovinos: number; ovinos: number; equinos: number }[];
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface AlertasRow extends RowDataPacket {
  total: number;
  sanitarias: number;
}

interface CorralesRow extends RowDataPacket {
  total: number;
  enUso: number;
}

interface ChartRow extends RowDataPacket {
  mes: number;
  especie: string;
  cantidad: number;
}

/** obtengo todas las métricas del panel admin en una sola llamada */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [[animalesRow]] = await pool.query<CountRow[]>(
    'SELECT COUNT(*) AS total FROM animales WHERE activo = 1',
  );
  const totalAnimales = Number(animalesRow?.total ?? 0);

  const [[mesAnteriorRow]] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM animales
     WHERE activo = 1 AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`,
  );
  const mesAnterior = Number(mesAnteriorRow?.total ?? 0);
  const variacionMes = totalAnimales - mesAnterior;

  const [[alertasRow]] = await pool.query<AlertasRow[]>(
    `SELECT
       SUM(estado_salud != 'sano') AS total,
       SUM(estado_salud IN ('enfermo','herido','en_tratamiento')) AS sanitarias
     FROM animales WHERE activo = 1`,
  );
  const alertas = alertasRow;
  const alertasActivas = Number(alertas?.total ?? 0);
  const alertasSanitarias = Number(alertas?.sanitarias ?? 0);
  const alertasReproductivas = Math.max(0, alertasActivas - alertasSanitarias);

  const [[corralesRow]] = await pool.query<CorralesRow[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(ocupados > 0) AS enUso
     FROM (
       SELECT c.id_corral,
         (SELECT COUNT(*) FROM animales a WHERE a.id_corral = c.id_corral AND a.activo = 1) AS ocupados
       FROM corrales c
       WHERE c.activo = 1 AND c.es_enfermeria = 0
     ) sub`,
  );
  const corrales = corralesRow;
  const corralesTotal = Number(corrales?.total ?? 0);
  const corralesEnUso = Number(corrales?.enUso ?? 0);

  const [chartRows] = await pool.query<ChartRow[]>(
    `SELECT MONTH(a.created_at) AS mes, e.nombre AS especie, COUNT(*) AS cantidad
     FROM animales a
     JOIN razas r ON r.id_raza = a.id_raza
     JOIN especies e ON e.id_especie = r.id_especie
     WHERE a.activo = 1 AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY MONTH(a.created_at), e.nombre`,
  );

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const resumenMensual = meses.map((mes, i) => {
    const filas = (chartRows as { mes: number; especie: string; cantidad: number }[]).filter(
      (f) => f.mes === i + 1,
    );
    const get = (esp: string) =>
      Number(filas.find((f) => f.especie === esp)?.cantidad ?? 0);
    return { mes, bovinos: get('Bovino'), ovinos: get('Ovino'), equinos: get('Equino') };
  });

  return {
    totalAnimales,
    variacionMes,
    alertasActivas,
    alertasSanitarias,
    alertasReproductivas,
    corralesTotal,
    corralesEnUso,
    corralesLibres: corralesTotal - corralesEnUso,
    clima: { temperatura: 25, descripcion: 'Parcialmente nublado' },
    resumenMensual,
  };
}
