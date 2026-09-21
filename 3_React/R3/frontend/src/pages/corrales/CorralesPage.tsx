/** gestión de corrales — fase 5 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Fence, Plus, Edit2, Trash2, X, HeartPulse } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import {
  listCorralesApi,
  createCorralApi,
  updateCorralApi,
  deleteCorralApi,
  type CreateCorralPayload,
} from '@/api/corralApi';
import type { Corral } from '@/types';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import styles from './CorralesPage.module.css';

export function CorralesPage() {
  const { showToast } = useToast();
  const [corrales, setCorrales] = useState<Corral[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCorral, setEditingCorral] = useState<Corral | null>(null);
  const [corralToDelete, setCorralToDelete] = useState<Corral | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCorralPayload>({
    defaultValues: {
      nombre: '',
      capacidad: 30,
      es_enfermeria: false,
    },
  });

  const loadCorrales = async () => {
    try {
      setLoading(true);
      const data = await listCorralesApi();
      setCorrales(data);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al cargar corrales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorrales();
  }, []);

  const openCreateModal = () => {
    setEditingCorral(null);
    reset({ nombre: '', capacidad: 30, es_enfermeria: false });
    setModalOpen(true);
  };

  const openEditModal = (corral: Corral) => {
    setEditingCorral(corral);
    reset({
      nombre: corral.nombre,
      capacidad: corral.capacidad,
      es_enfermeria: corral.es_enfermeria,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCorral(null);
    reset();
  };

  const onSubmit = async (data: CreateCorralPayload) => {
    try {
      if (editingCorral) {
        await updateCorralApi(editingCorral.id_corral, {
          nombre: data.nombre,
          capacidad: Number(data.capacidad),
          es_enfermeria: Boolean(data.es_enfermeria),
        });
        showToast('success', 'corral actualizado exitosamente');
      } else {
        await createCorralApi({
          nombre: data.nombre,
          capacidad: Number(data.capacidad),
          es_enfermeria: Boolean(data.es_enfermeria),
        });
        showToast('success', 'corral creado exitosamente');
      }
      closeModal();
      loadCorrales();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al guardar corral');
    }
  };

  const handleDelete = (corral: Corral) => {
    if (corral.ocupados > 0) {
      showToast('warning', 'no podés eliminar un corral con animales adentro');
      return;
    }
    setCorralToDelete(corral);
  };

  const confirmDeleteCorral = async () => {
    if (!corralToDelete) return;
    try {
      await deleteCorralApi(corralToDelete.id_corral);
      showToast('success', 'corral eliminado');
      setCorralToDelete(null);
      loadCorrales();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al eliminar corral');
    }
  };

  const totalCapacidad = corrales.reduce((acc, c) => acc + c.capacidad, 0);
  const totalOcupados = corrales.reduce((acc, c) => acc + c.ocupados, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Corrales</h1>
          <p>Supervisa la capacidad, ocupación y distribución de tus lotes y enfermería</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Corral
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total de Corrales</h3>
          <p>{corrales.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Capacidad Total</h3>
          <p>{totalCapacidad} plazas</p>
        </div>
        <div className={styles.statCard}>
          <h3>Ocupación Global</h3>
          <p>{totalOcupados} animales</p>
        </div>
        <div className={styles.statCard}>
          <h3>Espacio Disponible</h3>
          <p>{Math.max(0, totalCapacidad - totalOcupados)} libres</p>
        </div>
      </section>

      {loading ? (
        <div className={styles.loading}>cargando corrales...</div>
      ) : (
        <section className={styles.grid}>
          {corrales.map((corral) => {
            const pct = corral.capacidad > 0 ? Math.min(100, Math.round((corral.ocupados / corral.capacidad) * 100)) : 0;
            const fillClass = pct >= 90 ? styles.fillFull : pct >= 70 ? styles.fillWarning : styles.fillNormal;

            return (
              <div key={corral.id_corral} className={styles.corralCard}>
                <div className={styles.corralHeader}>
                  <div className={styles.corralTitle}>
                    {corral.es_enfermeria ? <HeartPulse size={20} color="#ef4444" /> : <Fence size={20} />}
                    <h3>{corral.nombre}</h3>
                  </div>
                  <span
                    className={`${styles.badge} ${
                      corral.es_enfermeria ? styles.badgeEnfermeria : styles.badgeGeneral
                    }`}
                  >
                    {corral.es_enfermeria ? 'Enfermería' : 'General'}
                  </span>
                </div>

                <div className={styles.occupancyInfo}>
                  <div className={styles.occupancyHeader}>
                    <span>Ocupación: {pct}%</span>
                    <strong>
                      {corral.ocupados} / {corral.capacidad}
                    </strong>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={`${styles.progressBarFill} ${fillClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className={styles.corralActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => openEditModal(corral)}
                    title="Editar corral"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => handleDelete(corral)}
                    title="Eliminar corral"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCorral ? 'Editar Corral' : 'Nuevo Corral'}</h2>
              <button type="button" className={styles.closeBtn} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label>Nombre del corral</label>
                <input
                  type="text"
                  placeholder="ej. Potrero Norte"
                  className={styles.input}
                  {...register('nombre', { required: 'el nombre es obligatorio' })}
                />
                {errors.nombre && <span className={styles.errorText}>{errors.nombre.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Capacidad máxima (animales)</label>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  {...register('capacidad', {
                    required: 'la capacidad es obligatoria',
                    min: { value: 1, message: 'mínimo 1' },
                  })}
                />
                {errors.capacidad && (
                  <span className={styles.errorText}>{errors.capacidad.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" {...register('es_enfermeria')} />
                  <span>Es corral de enfermería / sanidad</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editingCorral ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(corralToDelete)}
        title="Eliminar Corral"
        message={`¿Estás seguro de que deseas eliminar el corral "${corralToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Corral"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={confirmDeleteCorral}
        onCancel={() => setCorralToDelete(null)}
      />
    </div>
  );
}
