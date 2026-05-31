import type { UserRole } from '@/types/user.types';

export interface RoleConfig {
  id: UserRole;

  label: string;

  emoji: string;

  color: string;

  description: string;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'cliente',

    label: 'Cliente',

    emoji: '👤',

    color: '#0F172A',

    description:
      'Usuario que realiza envíos',
  },

  {
    id: 'repartidor',

    label: 'Repartidor',

    emoji: '🚛',

    color: '#FF7D29',

    description:
      'Encargado de entregas',
  },

  {
    id: 'recolector',

    label: 'Recolector',

    emoji: '🏃',

    color: '#16A34A',

    description:
      'Recolecta paquetes',
  },

  {
    id: 'supervisor',

    label: 'Supervisor',

    emoji: '👔',

    color: '#7C3AED',

    description:
      'Supervisa operaciones',
  },

  {
    id: 'admin',

    label: 'Administrador',

    emoji: '⚙️',

    color: '#DC2626',

    description:
      'Control total del sistema',
  },

  {
    id: 'remitente',

    label: 'Remitente',

    emoji: '📦',

    color: '#2563EB',

    description:
      'Empresa remitente',
  },
];
