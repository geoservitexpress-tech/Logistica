import { api } from '../shared/BaseService';

import {
  LoginPayload,
  RegisterPayload,
} from '@/types/auth.types';

export class AuthService {
  static async login(
    data: LoginPayload,
  ) {
    const response =
      await api.post(
        '/auth/login',
        data,
      );

    return response.data;
  }

  static async register(
    data: RegisterPayload,
  ) {
    const response =
      await api.post(
        '/auth/register',
        data,
      );

    return response.data;
  }
}