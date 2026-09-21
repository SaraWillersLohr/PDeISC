/** página principal del dashboard dueño/copropietario — fase 4 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CloudSun, Fence, PawPrint, Plus, TriangleAlert, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getDashboardSummaryApi } from '@/api/dashboardApi';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { DashboardSummary } from '@/types';
import { MetricCard } from '@/components/molecules/MetricCard';
import { FieldSummaryChart } from '@/components/molecules/FieldSummaryChart';
import { QuickActionCard } from '@/components/molecules/QuickActionCard';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { NotificationModal } from '@/components/molecules/NotificationModal';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { usuario, loginMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  // cargo métricas al montar con useEffect
  useEffect(() => {
    getDashboardSummaryApi()
      .then(setData)
      .catch((e) => showToast('error', getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <div className={styles.loading}>cargando métricas...</div>;
  if (!data) return null;

  const variacion =
    data.variacionMes >= 0 ? `+${data.variacionMes} desde el mes pasado` : `${data.variacionMes} desde el mes pasado`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>¡Hola, {usuario?.nombre}!</h1>
          <p>{usuario?.rolLabel}</p>
          <span className={styles.badge}>login: {loginMode === 'router' ? 'React Router' : 'useState'}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.bell}
            onClick={() => setNotifOpen(true)}
            aria-label="notificaciones"
          >
            <Bell size={20} />
            {data.alertasActivas > 0 && <span>{data.alertasActivas}</span>}
          </button>
          <ThemeToggle />
        </div>
      </header>

      <section className={styles.metrics}>
        <MetricCard title="Total de animales" value={data.totalAnimales} subtitle={variacion} icon={<PawPrint size={22} />} />
        <MetricCard
          title="Alertas activas"
          value={data.alertasActivas}
          subtitle={`${data.alertasSanitarias} sanitarias · ${data.alertasReproductivas} reproductiva${data.alertasReproductivas !== 1 ? 's' : ''}`}
          icon={<TriangleAlert size={22} />}
          variant="alert"
        />
        <MetricCard
          title="Corrales"
          value={data.corralesTotal}
          subtitle={`${data.corralesEnUso} en uso · ${data.corralesLibres} libre${data.corralesLibres !== 1 ? 's' : ''}`}
          icon={<Fence size={22} />}
        />
        <MetricCard
          title="Clima hoy"
          value={`${data.clima.temperatura}°C`}
          subtitle={data.clima.descripcion}
          icon={<CloudSun size={22} />}
          variant="info"
        />
      </section>

      <section className={styles.chartSection}>
        <h2>Resumen del campo</h2>
        <p>Últimos 12 meses</p>
        <FieldSummaryChart data={data.resumenMensual} />
      </section>

      <section className={styles.actions}>
        <QuickActionCard title="Gestión de Corrales" description="Crear, editar y eliminar lotes/corrales" icon={<Fence size={20} />} onClick={() => navigate('/dashboard/corrales')} />
        <QuickActionCard title="Mis animales" description="Ver y gestionar todos los animales" icon={<PawPrint size={20} />} onClick={() => navigate('/dashboard/animales')} />
        <QuickActionCard title="Mi Equipo" description="Peones, Veterinarios o Copropietarios" icon={<Users size={20} />} onClick={() => navigate('/dashboard/equipo')} />
        <QuickActionCard title="Agregar animal" description="Nuevo animal, especie o raza" icon={<Plus size={20} />} onClick={() => navigate('/dashboard/animales?nuevo=true')} />
      </section>

      {/* panel desplegable de notificaciones y alertas sanitarias */}
      <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
