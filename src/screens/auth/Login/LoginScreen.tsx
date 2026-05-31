// src/screens/auth/Login/LoginScreen.tsx

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ScreenContainer from '@/components/layout/ScreenContainer';
import AppHeader from '@/components/layout/AppHeader';
import AppInput from '@/components/forms/AppInput';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { QUICK_ACCESS } from './constants';
import { styles } from './LoginScreen.styles';
import { LoginForm } from './LoginScreen.types';

type Props = NativeStackScreenProps<{ Login: undefined; Register: undefined }, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion, loading } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    correo:   '',
    password: '',
  });

  async function handleLogin() {
    await iniciarSesion({
      correo:   form.correo,
      password: form.password,
      rol:      'cliente',
    });
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>GL</Text>
            <Text style={styles.brand}>LOGISTICAV2</Text>
            <Text style={styles.subtitle}>Plataforma logistica profesional</Text>
          </View>

          <View style={styles.card}>
            <AppHeader
              title="Bienvenido"
              subtitle="Ingresa tus credenciales para continuar"
            />

            <AppInput
              label="Correo electronico"
              placeholder="correo@empresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.correo}
              onChangeText={text => setForm(prev => ({ ...prev, correo: text }))}
            />

            <AppInput
              label="Contrasena"
              placeholder="••••••••"
              secureTextEntry
              value={form.password}
              onChangeText={text => setForm(prev => ({ ...prev, password: text }))}
            />

            <PrimaryButton
              title="Iniciar Sesion"
              onPress={handleLogin}
              loading={loading}
            />

            {/* Boton de registro */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ color: '#666' }}>No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: '#FF6B00', fontWeight: '700' }}>Registrate</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.quickAccessTitle}>ACCESO RAPIDO</Text>

            {QUICK_ACCESS.map(item => (
              <TouchableOpacity
                key={item.rol}
                style={styles.quickButton}
                onPress={() => iniciarSesion({ correo: item.correo, password: '12345678', rol: item.rol })}
              >
                <Text style={styles.quickButtonText}>Entrar como {item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}