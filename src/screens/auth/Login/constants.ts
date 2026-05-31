import { UserRole } from '@/types/user.types';

export const QUICK_ACCESS: {
  label: string;

  rol: UserRole;

  correo: string;
}[] = [
  {
    label: 'Cliente',

    rol: 'cliente',

    correo: 'cliente@test.com',
  },

  {
    label: 'Repartidor',

    rol: 'repartidor',

    correo: 'repartidor@test.com',
  },

  {
    label: 'Recolector',

    rol: 'recolector',

    correo: 'recolector@test.com',
  },

  {
    label: 'Supervisor',

    rol: 'supervisor',

    correo: 'supervisor@test.com',
  },

  {
    label: 'Admin',

    rol: 'admin',

    correo: 'admin@test.com',
  },
];