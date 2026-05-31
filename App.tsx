import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RutaProvider } from './src/context/RutaContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RutaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </RutaProvider>
    </AuthProvider>
  );
}