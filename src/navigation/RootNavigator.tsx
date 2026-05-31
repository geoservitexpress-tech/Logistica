// src/navigation/RootNavigator.tsx

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/navigation.types';
import AuthNavigator from '@/navigation/AuthNavigator';
import ClientNavigator from '@/navigation/ClientNavigator';
import RepartidorNavigator from '@/navigation/RepartidorNavigator';
import RecolectorNavigator from '@/navigation/RecolectorNavigator';
import SupervisorNavigator from '@/navigation/SupervisorNavigator';
import AdminNavigator from '@/navigation/AdminNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { usuario, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!usuario ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : usuario.rol === 'repartidor' ? (
        <Stack.Screen name="RepartidorApp" component={RepartidorNavigator} />
      ) : usuario.rol === 'recolector' ? (
        <Stack.Screen name="RecolectorApp" component={RecolectorNavigator} />
      ) : usuario.rol === 'supervisor' ? (
        <Stack.Screen name="SupervisorApp" component={SupervisorNavigator} />
      ) : usuario.rol === 'administrador' ? (
        <Stack.Screen name="AdminApp" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="ClientApp" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
}