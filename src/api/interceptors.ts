// src/api/interceptors.ts
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './client';

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.method === 'patch' && config.url?.includes('/supervisor/pedidos/')) {
      console.log('PATCH request headers:', JSON.stringify(config.headers, null, 2));
      console.log('PATCH request data:', JSON.stringify(config.data, null, 2));
      console.log('Token usado:', token ? token.slice(0, 50) + '...' : 'NO TOKEN');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log('Sesion expirada');
    }
    return Promise.reject(error);
  },
);