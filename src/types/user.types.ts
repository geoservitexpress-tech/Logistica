export type UserRole =
  | 'cliente'
  | 'repartidor'
  | 'recolector'
  | 'supervisor'
  | 'administrador'
  | 'remitente';

export interface User {
  id?: string;

  nombre: string;

  correo: string;

  telefono?: string;

  rol: UserRole;

  verificado?: boolean;

  avatar?: string;

  tiempoRuta?: string;

  enviosEntregados?: number;
}