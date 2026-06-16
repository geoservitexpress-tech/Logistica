// src/screens/auth/Login/LoginScreen.tsx

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from './LoginScreen.types';

type Props = NativeStackScreenProps<{ Login: undefined; Register: undefined }, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion, loading } = useAuth();
  const [form, setForm] = useState<LoginForm>({ correo: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    await iniciarSesion({ correo: form.correo, password: form.password, rol: 'cliente' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F2B46' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2B46" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TOP — LOGO */}
          <View style={{
            alignItems:     'center',
            justifyContent: 'center',
            paddingTop:     Platform.OS === 'ios' ? 80 : 60,
            paddingBottom:  40,
          }}>
            <View style={{
              width:           120,
              height:          120,
              borderRadius:    24,
              backgroundColor: '#fff',
              alignItems:      'center',
              justifyContent:  'center',
              shadowColor:     '#000',
              shadowOpacity:   0.3,
              shadowRadius:    16,
              elevation:       8,
            }}>
              <Image
                source={require('@/assets/images/geoservit-logo.png')}
                style={{ width: 100, height: 100, resizeMode: 'contain' }}
              />
            </View>
            <Text style={{
              color:         '#fff',
              fontSize:      22,
              fontWeight:    '800',
              marginTop:     20,
              letterSpacing: 1,
            }}>
              GEOSERVIT EXPRESS
            </Text>
            <Text style={{
              color:         'rgba(255,255,255,0.5)',
              fontSize:      12,
              letterSpacing: 3,
              marginTop:     4,
            }}>
              PLATAFORMA LOGÍSTICA
            </Text>
          </View>

          {/* CARD */}
          <View style={{
            flex:                    1,
            backgroundColor:         '#fff',
            borderTopLeftRadius:     36,
            borderTopRightRadius:    36,
            paddingHorizontal:       28,
            paddingTop:              36,
            paddingBottom:           48,
          }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#0F2B46', marginBottom: 4 }}>
              Iniciar Sesión
            </Text>
            <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 32 }}>
              Ingresa tus credenciales para continuar
            </Text>

            {/* CORREO */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B46', marginBottom: 8 }}>
              Correo electrónico
            </Text>
            <View style={{
              flexDirection:   'row',
              alignItems:      'center',
              backgroundColor: '#F8FAFC',
              borderRadius:    14,
              borderWidth:     1.5,
              borderColor:     form.correo ? '#E8712A' : '#E2E8F0',
              paddingHorizontal: 16,
              marginBottom:    20,
              height:          54,
            }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>✉️</Text>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F2B46' }}
                placeholder="correo@empresa.com"
                placeholderTextColor="#CBD5E1"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.correo}
                onChangeText={text => setForm(prev => ({ ...prev, correo: text }))}
              />
            </View>

            {/* CONTRASEÑA */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B46', marginBottom: 8 }}>
              Contraseña
            </Text>
            <View style={{
              flexDirection:   'row',
              alignItems:      'center',
              backgroundColor: '#F8FAFC',
              borderRadius:    14,
              borderWidth:     1.5,
              borderColor:     form.password ? '#E8712A' : '#E2E8F0',
              paddingHorizontal: 16,
              marginBottom:    32,
              height:          54,
            }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>🔒</Text>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F2B46' }}
                placeholder="••••••••"
                placeholderTextColor="#CBD5E1"
                secureTextEntry={!showPass}
                value={form.password}
                onChangeText={text => setForm(prev => ({ ...prev, password: text }))}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '👁️' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* BOTON */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#CBD5E1' : '#E8712A',
                borderRadius:    16,
                height:          56,
                alignItems:      'center',
                justifyContent:  'center',
                shadowColor:     '#E8712A',
                shadowOpacity:   0.4,
                shadowRadius:    12,
                elevation:       6,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
                    Iniciar Sesión
                  </Text>
              }
            </TouchableOpacity>

            {/* REGISTRO */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: '#E8712A', fontWeight: '700', fontSize: 14 }}>Regístrate</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 32, letterSpacing: 1 }}>
              © 2026 GEOSERVIT EXPRESS
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}