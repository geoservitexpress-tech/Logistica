// src/navigation/RepartidorNavigator.tsx

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '@/theme';

import PedidosScreen from '@/screens/repartidor/Pedidos/PedidosScreen';
import MiRutaScreen from '@/screens/repartidor/MiRuta/MiRutaScreen';
import HistorialRepartidorScreen from '@/screens/repartidor/Historial/HistorialRepartidorScreen';
import ConfirmarEntregaScreen from '@/screens/repartidor/ConfirmarEntrega/ConfirmarEntregaScreen';
import ProfileScreen from '@/screens/client/screens/Profile/ProfileScreen';

export type RepartidorTabParamList = {
  Pedidos:   undefined;
  Ruta:      undefined;
  Historial: undefined;
  Perfil:    undefined;
};

export type RutaStackParamList = {
  MiRutaHome: { pedidoCompletado?: string } | undefined;
  ConfirmarEntrega: {
    id:           string;
    direccion?:   string;
    destinatario?: string;
    telefono?:    string;
  };
};

const Tab   = createBottomTabNavigator<RepartidorTabParamList>();
const Stack = createNativeStackNavigator<RutaStackParamList>();

function RutaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MiRutaHome"       component={MiRutaScreen} />
      <Stack.Screen name="ConfirmarEntrega" component={ConfirmarEntregaScreen as React.ComponentType} />
    </Stack.Navigator>
  );
}

export default function RepartidorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:            false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height:        70,
          paddingBottom: 12,
        },
      }}
    >
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{'[P]'}</Text>,
        }}
      />
      <Tab.Screen
        name="Ruta"
        component={RutaStack}
        options={{
          tabBarLabel: 'Mi Ruta',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{'[R]'}</Text>,
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialRepartidorScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{'[H]'}</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{'[U]'}</Text>,
        }}
      />
    </Tab.Navigator>
  );
}