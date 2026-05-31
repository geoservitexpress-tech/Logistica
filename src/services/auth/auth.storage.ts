import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';

import { User } from '@/types/user.types';

export const authStorage = {
  async saveToken(
    token: string,
  ): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      token,
    );
  },

  async getToken(): Promise<
    string | null
  > {
    return AsyncStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    );
  },

  async saveUser(
    user: User,
  ): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user),
    );
  },

  async getUser(): Promise<
    User | null
  > {
    const user =
      await AsyncStorage.getItem(
        STORAGE_KEYS.USER,
      );

    return user
      ? JSON.parse(user)
      : null;
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    );

    await AsyncStorage.removeItem(
      STORAGE_KEYS.USER,
    );
  },
};