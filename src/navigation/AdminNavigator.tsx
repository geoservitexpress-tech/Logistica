// src/navigation/AdminNavigator.tsx

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/theme';
import DashboardAdminScreen from '@/screens/admin/Dashboard/DashboardAdminScreen';
import OperacionesScreen    from '@/screens/admin/Operaciones/OperacionesScreen';
import RolesScreen          from '@/screens/admin/Roles/RolesScreen';
import UsuariosScreen       from '@/screens/admin/Usuarios/UsuariosScreen';
import ProfileScreen        from '@/screens/client/screens/Profile/ProfileScreen';

export type AdminTabParamList = {
  Finanzas:   undefined;
  Operaciones: undefined;
  Roles:      undefined;
  Usuarios:   undefined;
  Perfil:     undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminNavigator() {
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
        name="Finanzas"
        component={DashboardAdminScreen}
        options={{
          tabBarLabel: 'Finanzas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Operaciones"
        component={OperacionesScreen}
        options={{
          tabBarLabel: 'Operaciones',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🚚</Text>,
        }}
      />
      <Tab.Screen
        name="Roles"
        component={RolesScreen}
        options={{
          tabBarLabel: 'Roles',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔑</Text>,
        }}
      />
      <Tab.Screen
        name="Usuarios"
        component={UsuariosScreen}
        options={{
          tabBarLabel: 'Usuarios',
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