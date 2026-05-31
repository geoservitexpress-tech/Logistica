import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LoginScreen from '@/screens/auth/Login/LoginScreen';

import RegisterScreen from '@/screens/auth/Register/RegisterScreen';

const Stack =
  createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
  name="Login"
  component={LoginScreen as React.ComponentType}
/>

<Stack.Screen
  name="Register"
  component={RegisterScreen as React.ComponentType}
/>
    </Stack.Navigator>
  );
}