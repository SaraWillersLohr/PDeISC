/** vista sanitaria de veterinario — enfocada exclusivamente en el corral de enfermería */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  HeartPulse,
  Bell,
  LogOut,
  FileText,
  CheckCircle2,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { NotificationModal } from '@/components/molecules/NotificationModal';
import {
  listAnimalesApi,
  updateAnimalApi,
  darDeAltaApi,
} from '@/api/animalApi';
import {
  listTratamientosApi,
  createTratamientoApi,
  type CreateTratamientoPayload,
} from '@/api/tratamientoApi';
import { listNotificacionesApi } from '@/api/notificacionApi';
import type { Animal, Tratamiento } from '@/types';
import styles from './VeterinarioPage.module.css';

interface NotaTratamientoFormData {
  descripcion: string;
  medicamento: string;
  observaciones: string;
}

export function VeterinarioPage() {
  const { usuario, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // modal de historial clínico y nueva nota
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [historial, setHistorial] = useState<Tratamiento[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // modal para dar de alta
  const [dischargeAnimal, setDischargeAnimal] = useState<Animal | null>(null);
  const [notasAlta, setNotasAlta] = useState('');
  const [submittingDischarge, setSubmittingDischarge] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isSubmittingNote },
  } = useForm<NotaTratamientoFormData>({
    defaultValues: {
      descripcion: '',
      medicamento: '',
      observaciones: '',
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [animData, notifs] = await Promise.all([
        listAnimalesApi(),
        listNotificacionesApi(),
      ]);
      setAnimales(animData);
      setAlertCount(notifs.length);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // filtro estricto: el veterinario solo se ocupa del corral de enfermería
  const animalesEnfermeria = useMemo(() => {
    return animales.filter((a) => a.corral_es_enfermeria);
  }, [animales]);

  // apertura de ficha e historial médico
  const openHistoryModal = async (animal: Animal) => {
    setSelectedAnimal(animal);
    reset();
    try {
      setLoadingHistorial(true);
      const data = await listTratamientosApi(animal.id_animal);
      setHistorial(data);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedAnimal(null);
    setHistorial([]);
    reset();
  };

  // registro de nueva nota de tratamiento
  const onSubmitNote = async (data: NotaTratamientoFormData) => {
    if (!selectedAnimal) return;
    try {
      const payload: CreateTratamientoPayload = {
        id_animal: selectedAnimal.id_animal,
        descripcion: data.descripcion.trim(),
        medicamento: data.medicamento.trim() || null,
        observaciones: data.observaciones.trim() || null,
      };
      await createTratamientoApi(payload);
      showToast('success', 'nota clínica y tratamiento guardados');
      reset();

      // si estaba solo 'enfermo', lo pasamos a 'en_tratamiento'
      if (selectedAnimal.estado_salud === 'enfermo') {
        await updateAnimalApi(selectedAnimal.id_animal, { estado_salud: 'en_tratamiento' });
      }

      // refrescamos historial
      const updated = await listTratamientosApi(selectedAnimal.id_animal);
      setHistorial(updated);
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al registrar tratamiento');
    }
  };

  // marcar en tratamiento directamente
  const handleSetInTreatment = async (animal: Animal) => {
    try {
      await updateAnimalApi(animal.id_animal, { estado_salud: 'en_tratamiento' });
      showToast('info', `animal ${animal.identificador} marcado en tratamiento`);
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al actualizar estado');
    }
  };

  // alta médica
  const openDischargeModal = (animal: Animal) => {
    setDischargeAnimal(animal);
    setNotasAlta('');
  };

  const handleConfirmDischarge = async () => {
    if (!dischargeAnimal) return;
    setSubmittingDischarge(true);
    try {
      await darDeAltaApi(dischargeAnimal.id_animal, notasAlta);
      showToast(
        'success',
        `alta médica otorgada a ${dischargeAnimal.identificador}: reintegrado a su corral`,
      );
      setDischargeAnimal(null);
      setNotasAlta('');
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al procesar alta');
    } finally {
      setSubmittingDischarge(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h1>Dra./Dr. {usuario?.nombre} {usuario?.apellido}</h1>
          <span className={styles.roleTag}>Veterinario · Sanidad Animal</span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.bellBtn}
            onClick={() => setNotifOpen(true)}
            title="alertas sanitarias"
            aria-label="alertas sanitarias"
          >
            <Bell size={18} />
            {alertCount > 0 && <span className={styles.bellBadge}>{alertCount}</span>}
          </button>
          <ThemeToggle />
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="cerrar sesión"
            aria-label="cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className={styles.banner}>
        <HeartPulse size={36} color="#ef4444" />
        <div className={styles.bannerText}>
          <h2>Corral de Enfermería y Cuarentena</h2>
          <p>
            Supervisión exclusiva de {animalesEnfermeria.length} animal(es) internados con seguimiento clínico y altas.
          </p>
        </div>
      </section>

      {loading ? (
        <div className={styles.emptyState}>cargando corral de enfermería...</div>
      ) : animalesEnfermeria.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
          <h3>¡Enfermería vacía!</h3>
          <p>No hay animales enfermos ni bajo tratamiento en este momento.</p>
        </div>
      ) : (
        <section className={styles.grid}>
          {animalesEnfermeria.map((animal) => {
            const isEnTratamiento = animal.estado_salud === 'en_tratamiento';
            return (
              <div key={animal.id_animal} className={styles.animalCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.caravana}>{animal.identificador}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      isEnTratamiento ? styles.statusTratamiento : styles.statusEnfermo
                    }`}
                  >
                    {isEnTratamiento ? 'En tratamiento' : 'Enfermo'}
                  </span>
                </div>

                {/* ficha técnica en modo lectura */}
                <div className={styles.techSheet}>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetLabel}>Nombre / Alias:</span>
                    <strong>{animal.nombre || 'Sin registrar'}</strong>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetLabel}>Especie y Raza:</span>
                    <span>{animal.especie_nombre} · {animal.raza_nombre}</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetLabel}>Peso registrado:</span>
                    <span>{animal.peso_kg ? `${animal.peso_kg} kg` : '—'}</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetLabel}>Fecha nacimiento:</span>
                    <span>{animal.fecha_nacimiento || '—'}</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetLabel}>Corral de origen:</span>
                    <span>Lote original asignado</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.btnHistory}
                    onClick={() => openHistoryModal(animal)}
                  >
                    <FileText size={15} />
                    Historial / Notas
                  </button>

                  {animal.estado_salud === 'enfermo' ? (
                    <button
                      type="button"
                      className={styles.btnHistory}
                      onClick={() => handleSetInTreatment(animal)}
                    >
                      <Activity size={15} />
                      Iniciar Tratamiento
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.btnDischarge}
                      onClick={() => openDischargeModal(animal)}
                    >
                      <CheckCircle2 size={15} />
                      Dar de Alta (Sano)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* modal de historial clínico y registro de nota médica */}
      {selectedAnimal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Historial Clínico: {selectedAnimal.identificador}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeHistoryModal}
                aria-label="cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Especie: <strong>{selectedAnimal.especie_nombre}</strong> ({selectedAnimal.raza_nombre}) · Estado:{' '}
              <strong style={{ textTransform: 'capitalize' }}>{selectedAnimal.estado_salud}</strong>
            </div>

            <h4>Evolución y notas médicas anteriores:</h4>
            <div className={styles.timeline}>
              {loadingHistorial ? (
                <p>cargando notas clínicas...</p>
              ) : historial.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  no hay notas médicas registradas aún para este animal.
                </p>
              ) : (
                historial.map((t) => (
                  <div key={t.id_tratamiento} className={styles.timelineItem}>
                    <p>
                      <strong>{t.descripcion}</strong>
                    </p>
                    {t.medicamento && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                        💊 Medicamento: {t.medicamento}
                      </p>
                    )}
                    {t.observaciones && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        📝 {t.observaciones}
                      </p>
                    )}
                    <div className={styles.timelineMeta}>
                      <span>{t.veterinario_nombre}</span>
                      <span>{t.fecha_inicio}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* formulario para registrar nueva nota médica */}
            <form onSubmit={handleSubmit(onSubmitNote)} className={styles.formSection}>
              <h3>
                <Stethoscope size={16} style={{ display: 'inline', marginRight: '0.35rem' }} />
                Registrar Nueva Nota / Tratamiento
              </h3>

              <div className={styles.formGroup}>
                <label>Diagnóstico / Descripción médica</label>
                <textarea
                  className={styles.textarea}
                  placeholder="ej. Se administra antiparasitario y antibiótico por cuadro respiratorio..."
                  {...register('descripcion', { required: 'la descripción es requerida' })}
                />
                {errors.descripcion && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>
                    {errors.descripcion.message}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Medicamento recetado / Dosis (opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Penicilina 20ml"
                  className={styles.input}
                  {...register('medicamento')}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Observaciones de evolución (opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Mantener en reposo 48 hs"
                  className={styles.input}
                  {...register('observaciones')}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeHistoryModal}>
                  Cerrar
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingNote}>
                  {isSubmittingNote ? 'Guardando...' : 'Guardar Tratamiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modal de confirmación de alta médica */}
      {dischargeAnimal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#22c55e' }}>Dar de Alta Sanitaria</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDischargeAnimal(null)}
                aria-label="cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
              El animal <strong>{dischargeAnimal.identificador}</strong> será declarado <strong>Sano</strong> y devuelto
              automáticamente a su corral general de origen.
            </p>

            <div className={styles.formGroup}>
              <label>Notas de cierre o recomendaciones de alta</label>
              <textarea
                className={styles.textarea}
                placeholder="ej. Totalmente recuperado, sin fiebre ni síntomas visibles."
                value={notasAlta}
                onChange={(e) => setNotasAlta(e.target.value)}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDischargeAnimal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ background: '#22c55e' }}
                disabled={submittingDischarge}
                onClick={handleConfirmDischarge}
              >
                {submittingDischarge ? 'Procesando...' : 'Confirmar Alta y Reintegrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* panel desplegable de notificaciones */}
      <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
