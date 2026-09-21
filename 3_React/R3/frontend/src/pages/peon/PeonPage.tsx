/** vista operativa de campo para peón — interfaz móvil y responsiva */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  PawPrint,
  Plus,
  Search,
  ArrowRightLeft,
  AlertTriangle,
  LogOut,
  X,
  Fence,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import {
  listAnimalesApi,
  createAnimalApi,
  updateAnimalApi,
  reportarEnfermedadApi,
  type CreateAnimalPayload,
} from '@/api/animalApi';
import { listCorralesApi } from '@/api/corralApi';
import { listEspeciesApi } from '@/api/especieApi';
import type { Animal, Corral, Especie } from '@/types';
import styles from './PeonPage.module.css';

interface NacimientoFormData {
  identificador: string;
  nombre: string;
  id_especie: number;
  id_raza: number;
  id_corral: number;
  peso_kg: string;
}

export function PeonPage() {
  const { usuario, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [animales, setAnimales] = useState<Animal[]>([]);
  const [corrales, setCorrales] = useState<Corral[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // modal de nacimiento
  const [birthModalOpen, setBirthModalOpen] = useState(false);

  // modal de traslado
  const [transferAnimal, setTransferAnimal] = useState<Animal | null>(null);
  const [destCorralId, setDestCorralId] = useState<number>(0);

  // modal de reporte de enfermedad
  const [sickAnimal, setSickAnimal] = useState<Animal | null>(null);
  const [sintomas, setSintomas] = useState('');
  const [submittingSick, setSubmittingSick] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: isSubmittingBirth },
  } = useForm<NacimientoFormData>({
    defaultValues: {
      identificador: '',
      nombre: '',
      id_especie: 0,
      id_raza: 0,
      id_corral: 0,
      peso_kg: '',
    },
  });

  const selectedEspecieId = watch('id_especie');

  const availableRazas = useMemo(() => {
    const esp = especies.find((e) => Number(e.id_especie) === Number(selectedEspecieId));
    return esp?.razas || [];
  }, [especies, selectedEspecieId]);

  // solo corrales generales activos (no enfermería)
  const corralesGenerales = useMemo(() => {
    return corrales.filter((c) => !c.es_enfermeria && c.activo);
  }, [corrales]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [animData, corrData, espData] = await Promise.all([
        listAnimalesApi(),
        listCorralesApi(),
        listEspeciesApi(),
      ]);
      setAnimales(animData);
      setCorrales(corrData);
      setEspecies(espData);
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

  // filtro de animales en corrales comunes (no en enfermería)
  const animalesCampo = useMemo(() => {
    return animales.filter((a) => {
      if (a.corral_es_enfermeria) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesId = a.identificador.toLowerCase().includes(term);
        const matchesName = a.nombre?.toLowerCase().includes(term) || false;
        if (!matchesId && !matchesName) return false;
      }
      return true;
    });
  }, [animales, search]);

  // alta de nacimiento
  const openBirthModal = () => {
    const defaultEsp = especies[0];
    const defaultRaza = defaultEsp?.razas[0];
    const defaultCorral = corralesGenerales.find((c) => c.ocupados < c.capacidad) || corralesGenerales[0];

    reset({
      identificador: '',
      nombre: '',
      id_especie: defaultEsp ? defaultEsp.id_especie : 0,
      id_raza: defaultRaza ? defaultRaza.id_raza : 0,
      id_corral: defaultCorral ? defaultCorral.id_corral : 0,
      peso_kg: '',
    });
    setBirthModalOpen(true);
  };

  const onSubmitBirth = async (data: NacimientoFormData) => {
    try {
      const payload: CreateAnimalPayload = {
        identificador: data.identificador.trim(),
        nombre: data.nombre.trim() || null,
        id_corral: Number(data.id_corral),
        id_raza: Number(data.id_raza),
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        peso_kg: data.peso_kg ? Number(data.peso_kg) : null,
        estado_salud: 'sano',
      };
      await createAnimalApi(payload);
      showToast('success', `nacimiento de ${payload.identificador} registrado con éxito`);
      setBirthModalOpen(false);
      reset();
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al registrar nacimiento');
    }
  };

  // traslado entre corrales comunes
  const openTransferModal = (animal: Animal) => {
    setTransferAnimal(animal);
    const available = corralesGenerales.find(
      (c) => c.id_corral !== animal.id_corral && c.ocupados < c.capacidad,
    );
    setDestCorralId(available ? available.id_corral : 0);
  };

  const handleConfirmTransfer = async () => {
    if (!transferAnimal || !destCorralId) return;
    try {
      await updateAnimalApi(transferAnimal.id_animal, { id_corral: destCorralId });
      showToast('success', `animal ${transferAnimal.identificador} trasladado correctamente`);
      setTransferAnimal(null);
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error en traslado');
    }
  };

  // reporte de enfermedad hacia enfermería
  const openSickModal = (animal: Animal) => {
    setSickAnimal(animal);
    setSintomas('');
  };

  const handleConfirmSick = async () => {
    if (!sickAnimal) return;
    setSubmittingSick(true);
    try {
      await reportarEnfermedadApi(sickAnimal.id_animal, sintomas);
      showToast(
        'warning',
        `animal ${sickAnimal.identificador} derivado a Enfermería y notificado al veterinario`,
      );
      setSickAnimal(null);
      setSintomas('');
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al reportar enfermedad');
    } finally {
      setSubmittingSick(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.userInfo}>
          <h1>¡Hola, {usuario?.nombre}!</h1>
          <span className={styles.roleTag}>Peón de Campo</span>
        </div>
        <div className={styles.topActions}>
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

      <section className={styles.actionBanner}>
        <div className={styles.actionBannerText}>
          <h2>Operativa de Campo</h2>
          <p>Supervisión, traslados y reporte de alertas</p>
        </div>
        <button type="button" className={styles.birthBtn} onClick={openBirthModal}>
          <Plus size={16} />
          Nuevo Nacimiento
        </button>
      </section>

      <div className={styles.searchCard}>
        <Search size={18} color="var(--color-text-muted)" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por caravana o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.sectionHeader}>
        <h3>Animales en Campo ({animalesCampo.length})</h3>
      </div>

      {loading ? (
        <div className={styles.emptyState}>cargando animales...</div>
      ) : animalesCampo.length === 0 ? (
        <div className={styles.emptyState}>
          <PawPrint size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>No se encontraron animales activos en corrales comunes.</p>
        </div>
      ) : (
        <div>
          {animalesCampo.map((animal) => (
            <div key={animal.id_animal} className={styles.animalCard}>
              <div className={styles.cardHeader}>
                <span className={styles.caravana}>{animal.identificador}</span>
                <span className={styles.corralLocation}>
                  <Fence size={15} />
                  {animal.corral_nombre}
                </span>
              </div>

              <div className={styles.cardDetails}>
                <div>
                  <strong>{animal.nombre || 'Sin alias'}</strong> · {animal.especie_nombre} ({animal.raza_nombre})
                </div>
                <div>
                  <span>Peso: {animal.peso_kg ? `${animal.peso_kg} kg` : 'no registrado'}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.btnTransfer}
                  onClick={() => openTransferModal(animal)}
                >
                  <ArrowRightLeft size={15} />
                  Trasladar
                </button>
                <button
                  type="button"
                  className={styles.btnSick}
                  onClick={() => openSickModal(animal)}
                >
                  <AlertTriangle size={15} />
                  Reportar Enfermo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal para registrar nacimiento */}
      {birthModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Registrar Nacimiento</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setBirthModalOpen(false)}
                aria-label="cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitBirth)}>
              <div className={styles.formGroup}>
                <label>Caravana / Identificador</label>
                <input
                  type="text"
                  placeholder="ej. BOV-105"
                  className={styles.input}
                  {...register('identificador', { required: 'la caravana es obligatoria' })}
                />
                {errors.identificador && (
                  <span className={styles.errorText}>{errors.identificador.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Nombre o alias (opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Ternero 1"
                  className={styles.input}
                  {...register('nombre')}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Especie</label>
                <select
                  className={styles.input}
                  {...register('id_especie', {
                    required: 'especie obligatoria',
                    onChange: (e) => {
                      const espId = Number(e.target.value);
                      const esp = especies.find((item) => item.id_especie === espId);
                      if (esp && esp.razas.length > 0) {
                        setValue('id_raza', esp.razas[0].id_raza);
                      }
                    },
                  })}
                >
                  <option value="">Seleccionar especie</option>
                  {especies.map((esp) => (
                    <option key={esp.id_especie} value={esp.id_especie}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Raza</label>
                <select
                  className={styles.input}
                  {...register('id_raza', { required: 'raza obligatoria' })}
                >
                  <option value="">Seleccionar raza</option>
                  {availableRazas.map((raza) => (
                    <option key={raza.id_raza} value={raza.id_raza}>
                      {raza.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Corral de destino</label>
                <select
                  className={styles.input}
                  {...register('id_corral', { required: 'corral obligatorio' })}
                >
                  <option value="">Seleccionar corral</option>
                  {corralesGenerales.map((corral) => {
                    const isFull = corral.ocupados >= corral.capacidad;
                    return (
                      <option
                        key={corral.id_corral}
                        value={corral.id_corral}
                        disabled={isFull}
                      >
                        {corral.nombre} ({corral.ocupados}/{corral.capacidad})
                        {isFull ? ' [LLENO]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Peso al nacer en kg (opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="ej. 35"
                  className={styles.input}
                  {...register('peso_kg')}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setBirthModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingBirth}>
                  {isSubmittingBirth ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modal para traslado de corral */}
      {transferAnimal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Trasladar {transferAnimal.identificador}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setTransferAnimal(null)}
                aria-label="cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
              Corral actual: <strong>{transferAnimal.corral_nombre}</strong>
            </p>

            <div className={styles.formGroup}>
              <label>Seleccionar nuevo corral de destino</label>
              <select
                className={styles.input}
                value={destCorralId}
                onChange={(e) => setDestCorralId(Number(e.target.value))}
              >
                <option value={0}>Seleccionar corral</option>
                {corralesGenerales
                  .filter((c) => c.id_corral !== transferAnimal.id_corral)
                  .map((c) => {
                    const isFull = c.ocupados >= c.capacidad;
                    return (
                      <option key={c.id_corral} value={c.id_corral} disabled={isFull}>
                        {c.nombre} ({c.ocupados}/{c.capacidad}) {isFull ? '[LLENO]' : ''}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setTransferAnimal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                disabled={!destCorralId}
                onClick={handleConfirmTransfer}
              >
                Confirmar Traslado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal para reportar enfermedad hacia enfermería */}
      {sickAnimal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#ef4444' }}>Reportar Enfermedad</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSickAnimal(null)}
                aria-label="cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
              El animal <strong>{sickAnimal.identificador}</strong> será trasladado automáticamente al
              corral de <strong>Enfermería</strong> y notificado al veterinario.
            </p>

            <div className={styles.formGroup}>
              <label>Síntomas observados / comentarios de campo</label>
              <textarea
                className={styles.textarea}
                placeholder="describí los síntomas (ej. renguera, decaimiento, tos, herida...)"
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setSickAnimal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.submitSickBtn}
                disabled={submittingSick}
                onClick={handleConfirmSick}
              >
                {submittingSick ? 'Enviando...' : 'Mover a Enfermería'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
