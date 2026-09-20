/** labels de roles para la api */
import type { RolNombre } from '../types';

/** etiquetas legibles para cada rol */
export const ROL_LABELS: Record<RolNombre, string> = {
  dueno: 'Dueño / Copropietario',
  copropietario: 'Copropietario',
  peon: 'Peón de Campo',
  veterinario: 'Veterinario',
};

/** roles con permisos administrativos completos */
export const ROLES_ADMIN: RolNombre[] = ['dueno', 'copropietario'];

/** solo el dueño puede crear copropietarios */
export const ROL_DUENO: RolNombre = 'dueno';

export function getRolLabel(rol: RolNombre): string {
  return ROL_LABELS[rol] ?? rol;
}

export function isAdmin(rol: RolNombre): boolean {
  return ROLES_ADMIN.includes(rol);
}
