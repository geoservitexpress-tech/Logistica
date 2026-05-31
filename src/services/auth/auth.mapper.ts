import { User } from '@/types/user.types';

export const authMapper = {
  toUser(data: any): User {
    return {
      id: data.id,

      nombre: data.nombre,

      correo: data.correo,

      rol: data.rol,

      telefono: data.telefono,

      verificado: data.verificado,
    };
  },
};