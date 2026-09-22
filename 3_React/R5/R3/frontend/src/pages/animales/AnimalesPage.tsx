// gesti�n completa de animales � fase 5
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PawPrint, Plus, Search, Edit2, Trash2, X, HeartPulse, Fence } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import {
  listAnimalesApi,
  createAnimalApi,
  updateAnimalApi,
  deleteAnimalApi,
  type CreateAnimalPayload,
} from '@/api/animalApi';
import { listCorralesApi } from '@/api/corralApi';
import { listEspeciesApi } from '@/api/especieApi';
import type { Animal, Corral, Especie, EstadoSalud } from '@/types';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import styles from './AnimalesPage.module.css';

interface AnimalFormData {
  identificador: string;
  nombre: string;
  id_especie: number;
  id_raza: number;
  id_corral: number;
  fecha_nacimiento: string;
  peso_kg: string;
  estado_salud: EstadoSalud;
}

// ejecuto animalespage
export function AnimalesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [animales, setAnimales] = useState<Animal[]>([]);
  const [corrales, setCorrales] = useState<Corral[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [search, setSearch] = useState('');
  const [filtroCorral, setFiltroCorral] = useState<number | ''>('');
  const [filtroEspecie, setFiltroEspecie] = useState<number | ''>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoSalud | ''>('');

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormData>({
    defaultValues: {
      identificador: '',
      nombre: '',
      id_especie: 0,
      id_raza: 0,
      id_corral: 0,
      fecha_nacimiento: '',
      peso_kg: '',
      estado_salud: 'sano',
    },
  });

  const selectedEspecieId = watch('id_especie');

  // razas disponibles seg�n la especie seleccionada
  const availableRazas = useMemo(() => {
    const esp = especies.find((e) => Number(e.id_especie) === Number(selectedEspecieId));
    return esp?.razas || [];
  }, [especies, selectedEspecieId]);

  // ejecuto loaddata
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

  // ejecuto el callback del hook
  useEffect(() => {
    loadData();
  }, []);

  // si llega ?nuevo=true en url (ej. desde acci�n r�pida del dashboard), abrir modal
  useEffect(() => {
    if (searchParams.get('nuevo') === 'true' && especies.length > 0 && corrales.length > 0) {
      openCreateModal();
      searchParams.delete('nuevo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, especies, corrales]);

  // ejecuto opencreatemodal
  const openCreateModal = () => {
    setEditingAnimal(null);
    const defaultEsp = especies[0];
    const defaultRaza = defaultEsp?.razas[0];
    const defaultCorral = corrales.find((c) => !c.es_enfermeria && c.ocupados < c.capacidad) || corrales[0];

    reset({
      identificador: '',
      nombre: '',
      id_especie: defaultEsp ? defaultEsp.id_especie : 0,
      id_raza: defaultRaza ? defaultRaza.id_raza : 0,
      id_corral: defaultCorral ? defaultCorral.id_corral : 0,
      fecha_nacimiento: '',
      peso_kg: '',
      estado_salud: 'sano',
    });
    setModalOpen(true);
  };

  // ejecuto openeditmodal
  const openEditModal = (animal: Animal) => {
    setEditingAnimal(animal);
    reset({
      identificador: animal.identificador,
      nombre: animal.nombre || '',
      id_especie: animal.id_especie,
      id_raza: animal.id_raza,
      id_corral: animal.id_corral,
      fecha_nacimiento: animal.fecha_nacimiento || '',
      peso_kg: animal.peso_kg !== null ? String(animal.peso_kg) : '',
      estado_salud: animal.estado_salud,
    });
    setModalOpen(true);
  };

  // ejecuto closemodal
  const closeModal = () => {
    setModalOpen(false);
    setEditingAnimal(null);
    reset();
  };

  // ejecuto onsubmit
  const onSubmit = async (data: AnimalFormData) => {
    try {
      const payload: CreateAnimalPayload = {
        identificador: data.identificador.trim(),
        nombre: data.nombre.trim() || null,
        id_corral: Number(data.id_corral),
        id_raza: Number(data.id_raza),
        fecha_nacimiento: data.fecha_nacimiento || null,
        peso_kg: data.peso_kg ? Number(data.peso_kg) : null,
        estado_salud: data.estado_salud,
      };

      if (editingAnimal) {
        await updateAnimalApi(editingAnimal.id_animal, payload);
        showToast('success', 'animal actualizado');
      } else {
        await createAnimalApi(payload);
        showToast('success', 'animal registrado con éxito');
      }
      closeModal();
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al guardar animal');
    }
  };

  // ejecuto handledelete
  const handleDelete = (animal: Animal) => {
    setAnimalToDelete(animal);
  };

  // ejecuto confirmdeleteanimal
  const confirmDeleteAnimal = async () => {
    if (!animalToDelete) return;
    try {
      await deleteAnimalApi(animalToDelete.id_animal);
      showToast('success', 'animal dado de baja');
      setAnimalToDelete(null);
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al eliminar animal');
    }
  };

  // filtrado en memoria
  const filteredAnimales = useMemo(() => {
    return animales.filter((a) => {
      if (filtroCorral !== '' && a.id_corral !== Number(filtroCorral)) return false;
      if (filtroEspecie !== '' && a.id_especie !== Number(filtroEspecie)) return false;
      if (filtroEstado !== '' && a.estado_salud !== filtroEstado) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesId = a.identificador.toLowerCase().includes(term);
        const matchesName = a.nombre?.toLowerCase().includes(term) || false;
        if (!matchesId && !matchesName) return false;
      }
      return true;
    });
  }, [animales, filtroCorral, filtroEspecie, filtroEstado, search]);

  const hasActiveFilters = search || filtroCorral !== '' || filtroEspecie !== '' || filtroEstado !== '';

  // ejecuto clearfilters
  const clearFilters = () => {
    setSearch('');
    setFiltroCorral('');
    setFiltroEspecie('');
    setFiltroEstado('');
  };

  // ejecuto getstatusbadgeclass
  const getStatusBadgeClass = (status: EstadoSalud) => {
    switch (status) {
      case 'sano':
        return styles.statusSano;
      case 'enfermo':
        return styles.statusEnfermo;
      case 'herido':
        return styles.statusHerido;
      case 'en_tratamiento':
        return styles.statusTratamiento;
      default:
        return '';
    }
  };

  // ejecuto formatstatus
  const formatStatus = (status: EstadoSalud) => {
    switch (status) {
      case 'sano':
        return 'Sano';
      case 'enfermo':
        return 'Enfermo';
      case 'herido':
        return 'Herido';
      case 'en_tratamiento':
        return 'En tratamiento';
      default:
        return status;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Mis Animales</h1>
          <p>Catálogo general de ganado, estado de salud y asignación de corrales</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={18} />
          Agregar Animal
        </button>
      </header>

      <section className={styles.filterCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por caravana o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.select}
          value={filtroCorral}
          onChange={(e) => setFiltroCorral(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Todos los corrales</option>
          {corrales.map((c) => (
            <option key={c.id_corral} value={c.id_corral}>
              {c.nombre} {c.es_enfermeria ? '(Enfermería)' : ''}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filtroEspecie}
          onChange={(e) => setFiltroEspecie(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Todas las especies</option>
          {especies.map((e) => (
            <option key={e.id_especie} value={e.id_especie}>
              {e.nombre}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado((e.target.value as EstadoSalud) || '')}
        >
          <option value="">Todos los estados</option>
          <option value="sano">Sano</option>
          <option value="enfermo">Enfermo</option>
          <option value="herido">Herido</option>
          <option value="en_tratamiento">En tratamiento</option>
        </select>

        {hasActiveFilters && (
          <button type="button" className={styles.clearBtn} onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </section>

      {loading ? (
        <div className={styles.emptyState}>cargando animales...</div>
      ) : filteredAnimales.length === 0 ? (
        <div className={styles.emptyState}>
          <PawPrint size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>No se encontraron animales con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Caravana / ID</th>
                <th>Nombre</th>
                <th>Especie / Raza</th>
                <th>Corral Actual</th>
                <th>Peso</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimales.map((animal) => (
                <tr key={animal.id_animal}>
                  <td>
                    <span className={styles.idBadge}>{animal.identificador}</span>
                  </td>
                  <td>
                    <strong>{animal.nombre || ''}</strong>
                  </td>
                  <td>
                    {animal.especie_nombre} · <small>{animal.raza_nombre}</small>
                  </td>
                  <td>
                    <span className={styles.corralTag}>
                      {animal.corral_es_enfermeria ? (
                        <HeartPulse size={16} color="#ef4444" />
                      ) : (
                        <Fence size={16} />
                      )}
                      {animal.corral_nombre}
                    </span>
                  </td>
                  <td>{animal.peso_kg ? `${animal.peso_kg} kg` : ''}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(animal.estado_salud)}`}>
                      {formatStatus(animal.estado_salud)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => openEditModal(animal)}
                        title="Editar / Trasladar animal"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(animal)}
                        title="Dar de baja animal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingAnimal ? 'Editar Animal / Traslado' : 'Nuevo Animal'}</h2>
              <button type="button" className={styles.closeBtn} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Identificador / Caravana</label>
                  <input
                    type="text"
                    placeholder="ej. BOV-042"
                    className={styles.input}
                    {...register('identificador', { required: 'identificador obligatorio' })}
                  />
                  {errors.identificador && (
                    <span className={styles.errorText}>{errors.identificador.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Nombre o alias (opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. Campeón"
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
                  {errors.id_raza && (
                    <span className={styles.errorText}>{errors.id_raza.message}</span>
                  )}
                </div>

                <div className={styles.formGroupFull}>
                  <div className={styles.formGroup}>
                    <label>Corral Asignado</label>
                    <select
                      className={styles.input}
                      {...register('id_corral', { required: 'corral obligatorio' })}
                    >
                      <option value="">Seleccionar corral</option>
                      {corrales.map((corral) => {
                        const isFull =
                          corral.ocupados >= corral.capacidad &&
                          (!editingAnimal || editingAnimal.id_corral !== corral.id_corral);
                        return (
                          <option
                            key={corral.id_corral}
                            value={corral.id_corral}
                            disabled={isFull}
                          >
                                {corral.nombre} ({corral.ocupados}/{corral.capacidad})
                                {isFull ? ' [COMPLETO]' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {errors.id_corral && (
                      <span className={styles.errorText}>{errors.id_corral.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Peso estimado (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ej. 450"
                    className={styles.input}
                    {...register('peso_kg')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    className={styles.input}
                    {...register('fecha_nacimiento')}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <div className={styles.formGroup}>
                    <label>Estado de Salud</label>
                    <select className={styles.input} {...register('estado_salud')}>
                      <option value="sano">Sano</option>
                      <option value="enfermo">Enfermo</option>
                      <option value="herido">Herido</option>
                      <option value="en_tratamiento">En tratamiento</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editingAnimal ? 'Actualizar' : 'Guardar Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(animalToDelete)}
        title="Dar de Baja Animal"
        message={`¿Estás seguro de dar de baja al animal con caravana "${animalToDelete?.identificador}"?`}
        confirmText="Dar de Baja"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={confirmDeleteAnimal}
        onCancel={() => setAnimalToDelete(null)}
      />
    </div>
  );
}

