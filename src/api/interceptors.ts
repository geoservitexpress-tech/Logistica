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