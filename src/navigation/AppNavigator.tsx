import React from 'react';

import { useAuth } from '@/context/AuthContext';
import AuthNavigator from './AuthNavigator';

import ClientNavigator from './ClientNavigator';

import AdminNavigator from './AdminNavigator';

import RepartidorNavigator from './RepartidorNavigator';

export default function AppNavigator() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <AuthNavigator />;
  }

  if (usuario.rol === 'cliente') {
    return <ClientNavigator />;
  }

  if (usuario.rol === 'admin') {
    return <AdminNavigator />;
  }

  if (usuario.rol === 'repartidor') {
    return <RepartidorNavigator />;
  }

  return <AuthNavigator />;
}