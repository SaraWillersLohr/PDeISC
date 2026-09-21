// gesti�n de equipo de trabajo � fase 5
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, UserPlus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  listUsuariosApi,
  createUsuarioApi,
  deleteUsuarioApi,
  type CreateUsuarioPayload,
} from '@/api/usuarioApi';
import type { Usuario, RolNombre } from '@/types';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import styles from './EquipoPage.module.css';

// ejecuto equipopage
export function EquipoPage() {
  const { usuario: currentUser } = useAuth();
  const { showToast } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUsuarioPayload>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'peon',
    },
  });

  // ejecuto loadusuarios
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await listUsuariosApi();
      setUsuarios(data);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al cargar equipo');
    } finally {
      setLoading(false);
    }
  };

  // ejecuto el callback del hook
  useEffect(() => {
    loadUsuarios();
  }, []);

  // ejecuto opencreatemodal
  const openCreateModal = () => {
    reset({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'peon',
    });
    setModalOpen(true);
  };

  // ejecuto closemodal
  const closeModal = () => {
    setModalOpen(false);
    reset();
  };

  // ejecuto onsubmit
  const onSubmit = async (data: CreateUsuarioPayload) => {
    try {
      await createUsuarioApi(data);
      showToast('success', 'miembro incorporado al equipo');
      closeModal();
      loadUsuarios();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al crear usuario');
    }
  };

  // ejecuto handledelete
  const handleDelete = (usuario: Usuario) => {
    if (usuario.id_usuario === currentUser?.id_usuario) {
      showToast('warning', 'no podés eliminar tu propia cuenta');
      return;
    }
    setUserToDelete(usuario);
  };

  // ejecuto confirmdeleteusuario
  const confirmDeleteUsuario = async () => {
    if (!userToDelete) return;
    try {
      await deleteUsuarioApi(userToDelete.id_usuario);
      showToast('success', 'usuario dado de baja');
      setUserToDelete(null);
      loadUsuarios();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'error al eliminar usuario');
    }
  };

  // ejecuto countrol
  const countRol = (rol: RolNombre) => usuarios.filter((u) => u.rol === rol).length;

  // ejecuto getrolebadgeclass
  const getRoleBadgeClass = (rol: RolNombre) => {
    switch (rol) {
      case 'dueno':
        return styles.roleDueno;
      case 'copropietario':
        return styles.roleCoprop;
      case 'peon':
        return styles.rolePeon;
      case 'veterinario':
        return styles.roleVet;
      default:
        return '';
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Mi Equipo</h1>
          <p>Administración del personal, peones de campo, veterinarios y copropietarios</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={openCreateModal}>
          <UserPlus size={18} />
          Nuevo Miembro
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Miembros</h3>
          <p>{usuarios.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Dueños / Coprop</h3>
          <p>{countRol('dueno') + countRol('copropietario')}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Peones de Campo</h3>
          <p>{countRol('peon')}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Veterinarios</h3>
          <p>{countRol('veterinario')}</p>
        </div>
      </section>

      {loading ? (
        <div className={styles.emptyState}>cargando equipo...</div>
      ) : usuarios.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>No hay miembros registrados.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Correo Electrónico</th>
                <th>Rol Asignado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => {
                const isSelf = user.id_usuario === currentUser?.id_usuario;
                const initials = `${user.nombre[0] || ''}${user.apellido[0] || ''}`.toUpperCase();

                return (
                  <tr key={user.id_usuario}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{initials}</div>
                        <div>
                          <strong>
                            {user.nombre} {user.apellido}
                          </strong>
                          {isSelf && <small style={{ display: 'block', color: 'var(--color-primary-light)' }}>Tú</small>}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.rol)}`}>
                        {user.rolLabel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          disabled={isSelf}
                          onClick={() => handleDelete(user)}
                          title={isSelf ? 'No podés eliminar tu propia cuenta' : 'Dar de baja usuario'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Nuevo Miembro del Equipo</h2>
              <button type="button" className={styles.closeBtn} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="ej. Juan"
                    className={styles.input}
                    {...register('nombre', { required: 'el nombre es obligatorio' })}
                  />
                  {errors.nombre && <span className={styles.errorText}>{errors.nombre.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Apellido (opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. Gómez"
                    className={styles.input}
                    {...register('apellido')}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <div className={styles.formGroup}>
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="ej. juan@estancia.app"
                      className={styles.input}
                      {...register('email', {
                        required: 'el correo es obligatorio',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'ingresá un correo válido',
                        },
                      })}
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
                  </div>
                </div>

                <div className={styles.formGroupFull}>
                  <div className={styles.formGroup}>
                    <label>Contraseña provisoria</label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className={styles.input}
                      {...register('password', {
                        required: 'la contraseña es obligatoria',
                        minLength: { value: 6, message: 'mínimo 6 caracteres' },
                      })}
                    />
                    {errors.password && (
                      <span className={styles.errorText}>{errors.password.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroupFull}>
                  <div className={styles.formGroup}>
                    <label>Rol en la estancia</label>
                    <select
                      className={styles.input}
                      {...register('rol', { required: 'el rol es obligatorio' })}
                    >
                      <option value="peon">Peón (Operativo de campo y alertas)</option>
                      <option value="veterinario">Veterinario (Sanidad y tratamientos)</option>
                      {currentUser?.rol === 'dueno' && (
                        <option value="copropietario">Copropietario (Administrativo)</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Dar de Baja Empleado"
        message={`¿Estás seguro de que deseas dar de baja a ${userToDelete?.nombre} ${userToDelete?.apellido} (${userToDelete?.rolLabel})?`}
        confirmText="Dar de Baja"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={confirmDeleteUsuario}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

