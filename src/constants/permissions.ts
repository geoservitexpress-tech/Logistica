import type { UserRole } from '@/types/user.types';

export const ROLE_PERMISSIONS: Record<
  UserRole,
  string[]
> = {
  cliente: [
    'create_order',

    'view_orders',

    'track_order',
  ],

  repartidor: [
    'view_route',

    'confirm_delivery',

    'update_location',
  ],

  recolector: [
    'pickup_package',
  ],

  supervisor: [
    'view_dashboard',

    'manage_routes',

    'view_analytics',
  ],

  admin: ['*'],

  remitente: [
    'create_mass_orders',

    'view_reports',
  ],
};