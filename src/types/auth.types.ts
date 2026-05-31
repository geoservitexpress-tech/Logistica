import { UserRole } from './user.types';

export interface LoginPayload {
  correo: string;
  password?: string;
  rol?: UserRole;
}

export interface RegisterPayload {
  nombre: string;
  correo: string;
  telefono: string;
  password?: string;
  rol: UserRole;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  usuario: AuthUser;
}

export interface AuthUser {
  id?: string;
  nombre: string;
  correo: string;
  rol: UserRole;
}