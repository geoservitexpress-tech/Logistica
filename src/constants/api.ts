export const API_CONFIG = {
  //BASE_URL: 'https://backlogistica-production-c7a3.up.railway.app',
  BASE_URL: 'http://192.168.1.84:3000',
  TIMEOUT: 60000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',

    REGISTER: '/auth/register',

    PROFILE: '/auth/profile',
  },

  PEDIDOS: {
    LIST: '/pedidos',

    CREATE: '/pedidos/create',

    DETAIL: '/pedidos/detail',

    UPDATE_STATUS:
      '/pedidos/update-status',
  },

  TRACKING: {
    LIVE: '/tracking/live',

    HISTORY:
      '/tracking/history',
  },
};