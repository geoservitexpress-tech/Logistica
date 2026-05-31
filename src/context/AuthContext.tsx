// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/api';
import type { UserRole } from '@/types/user.types';

export interface Usuario {
  idUsuario?: string;
  correo:     string;
  nombres?:   string;
  apellidos?: string;
  rol?:       UserRole;
  roles?:     string[];
}

interface LoginPayload {
  correo:    string;
  password?: string;
  rol?:      UserRole;
}

interface RegisterPayload {
  nombres:         string;
  apellidos:       string;
  correo:          string;
  telefono:        string;
  documento:       string;
  password:        string;
  fkTipoDocumento: number;
  idRol:           number;
}

export interface AuthContextData {
  usuario:       Usuario | null;
  token:         string | null;
  loading:       boolean;
  initializing:  boolean;
  iniciarSesion: (data: LoginPayload) => Promise<void>;
  registrar:     (data: RegisterPayload) => Promise<void>;
  cerrarSesion:  () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [usuario,      setUsuario]      = useState<Usuario | null>(null);
  const [token,        setToken]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    cargarSesion();
  }, []);

  async function cargarSesion() {
    try {
      const tokenGuardado   = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.log('ERROR CARGANDO SESION', error);
    } finally {
      setInitializing(false);
    }
  }

  async function iniciarSesion(data: LoginPayload) {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/login`,
        { correo: data.correo, password: data.password },
        { timeout: 60000 },
      );

      const result = response.data;


      
      const usuarioLogueado = {
        ...result.usuario,
        rol: result.usuario?.roles?.[0]?.toLowerCase() || 'cliente',
        
      };

      console.log('RESULTADO LOGIN:', JSON.stringify(result));

      console.log('USUARIO LOGUEADO:', JSON.stringify(usuarioLogueado));

      setUsuario(usuarioLogueado);
      setToken(result.access_token);

      await AsyncStorage.setItem('token', result.access_token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioLogueado));

    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.log('ERROR LOGIN', err?.response?.data || err?.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function registrar(data: RegisterPayload) {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/register`,
        {
          correo:          data.correo,
          password:        data.password,
          nombres:         data.nombres,
          apellidos:       data.apellidos,
          fkTipoDocumento: data.fkTipoDocumento,
          documento:       data.documento,
          telefono:        data.telefono,
          idRol:           data.idRol,
        },
        { timeout: 60000 },
      );

      const result = response.data;

      const usuarioRegistrado = {
        ...result.usuario,
        rol: result.usuario?.roles?.[0]?.toLowerCase() || 'cliente',
      };

      setUsuario(usuarioRegistrado);
      setToken(result.access_token);

      await AsyncStorage.setItem('token', result.access_token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioRegistrado));

    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.log('ERROR REGISTER', err?.response?.data || err?.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function cerrarSesion() {
    setUsuario(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        initializing,
        iniciarSesion,
        registrar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

