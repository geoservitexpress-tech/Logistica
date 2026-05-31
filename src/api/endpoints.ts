// src/api/endpoints.ts

export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    PROFILE:  '/auth/profile',
  },

  PEDIDOS: {
    GET_ALL:       '/pedidos',
    GET_BY_ID:     (id: string) => `/pedidos/${id}`,
    CREATE:        '/pedidos',
    UPDATE_STATUS: (id: string) => `/pedidos/${id}/estado`,
  },

  CATALOGO: {
    PAISES:        '/catalogo/paises',
    DEPARTAMENTOS: '/catalogo/departamentos',
    CIUDADES:      '/catalogo/ciudades',
    TIPOS_VIA:     '/catalogo/tipos-via',
  },

  TRACKING: {
    LIVE: '/tracking/live',
  },

  USERS: {
    GET_ALL: '/usuarios',
  },
};