// src/navigation/ClientNavigator.tsx
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '@/theme';
import type {
  ClientTabParamList,
  PedidosStackParamList,
} from '@/navigation/navigation.types';
import OrderHistoryScreen from '@/screens/client/screens/OrderHistory/OrderHistoryScreen';
import ProfileScreen from '@/screens/client/screens/Profile/ProfileScreen';
import NewOrderScreen from '@/screens/client/screens/Orders/NewOrderScreen';
import RequestPickupScreen from '@/screens/client/screens/RequestPickup/RequestPickupScreen';

const PedidosStack = createNativeStackNavigator<PedidosStackParamList>();

function PedidosNavigator() {
  return (
    <PedidosStack.Navigator screenOptions={{ headerShown: false }}>
      <PedidosStack.Screen name="NuevoPedido" component={NewOrderScreen} />
      <PedidosStack.Screen
  name="SolicitarRecogida"
  component={RequestPickupScreen as React.ComponentType}
/>
    </PedidosStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<ClientTabParamList>();

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="PedidosTab"
        component={PedidosNavigator}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>{'[P]'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={OrderHistoryScreen}
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>{'[H]'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>{'[U]'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}