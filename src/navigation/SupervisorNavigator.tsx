// src/navigation/SupervisorNavigator.tsx

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '@/theme';

import OrdersScreen    from '@/screens/supervisor/Orders/OrdersScreen';
import EditOrderScreen from '@/screens/supervisor/Orders/EditOrder/EditOrderScreen';
import TeamScreen      from '@/screens/supervisor/Team/TeamScreen';
import InsightsScreen  from '@/screens/supervisor/Insights/InsightsScreen';
import ProfileScreen   from '@/screens/client/screens/Profile/ProfileScreen';

export type SupervisorTabParamList = {
  Estadisticas: undefined;
  Orders:       undefined;
  Team:         undefined;
  Perfil:       undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  EditOrder:  { idPedido: string; numGuia: string };
};

const Tab   = createBottomTabNavigator<SupervisorTabParamList>();
const Stack = createNativeStackNavigator<OrdersStackParamList>();

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="EditOrder"  component={EditOrderScreen as React.ComponentType} />
    </Stack.Navigator>
  );
}

export default function SupervisorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height:          70,
          paddingBottom:   12,
          backgroundColor: COLORS.white,
          borderTopWidth:  1,
          borderTopColor:  COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="Estadisticas"
        component={InsightsScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Estadísticas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Equipo',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}