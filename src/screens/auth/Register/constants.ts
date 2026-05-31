import { UserRole } from '@/types/user.types';

export interface RoleOption {
  id: UserRole;

  emoji: string;

  nombre: string;

  desc: string;
}

export const ROLES: RoleOption[] = [
  {
    id: 'cliente',

    emoji: '👤',

    nombre: 'Soy Cliente',

    desc: 'Quiero realizar envíos',
  },

  {
    id: 'repartidor',

    emoji: '🚛',

    nombre: 'Soy Repartidor',

    desc: 'Busco generar ingresos',
  },

  {
    id: 'remitente',

    emoji: '📦',

    nombre: 'Soy Remitente',

    desc: 'Gestión empresarial',
  },
];

export const TIPOS_DOCUMENTO = [
  'CC - Cédula de Ciudadanía',

  'NIT',

  'CE - Cédula de Extranjería',

  'Pasaporte',
];
