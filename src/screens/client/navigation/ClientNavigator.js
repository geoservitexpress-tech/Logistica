import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { COLORS, FONT } from '../../../theme';

import OrderHistoryScreen from '../screens/OrderHistory/OrderHistoryScreen';
import NewOrderScreen from '../screens/Orders/NewOrderScreen';
import RequestPickupScreen from '../screens/RequestPickup/RequestPickupScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }) => (
  <View style={{ alignItems: 'center', paddingTop: 4, width: 60 }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text numberOfLines={1} style={{ fontSize: 9, color: focused ? COLORS.primary : COLORS.textSecondary, ...FONT.medium, marginTop: 1 }}>{label}</Text>
  </View>
);

function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistorialPedidos" component={OrderHistoryScreen} />
      <Stack.Screen name="NuevoPedido" component={NewOrderScreen} />
      <Stack.Screen name="SolicitarRecogida" component={RequestPickupScreen} />
    </Stack.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen name="Pedidos" component={PedidosStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Pedidos" focused={focused} /> }} />
      <Tab.Screen name="Perfil" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} /> }} />
    </Tab.Navigator>
  );
}