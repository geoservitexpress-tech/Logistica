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
import { COLORS } from '@/theme';
import FormErrorBanner, { FieldErrorText } from '@/components/feedback/FormErrorBanner/FormErrorBanner';
import { clearFieldError, getApiErrorMessage } from '@/utils/helpers';
import { validateLogin } from '@/utils/validators';
import type { FieldErrors } from '@/utils/validators';
import { LoginForm } from './LoginScreen.types';

type Props = NativeStackScreenProps<{ Login: undefined; Register: undefined }, 'Login'>;

function inputBorderColor(hasValue: boolean, hasError: boolean): string {
  if (hasError) return COLORS.error;
  if (hasValue) return '#E8712A';
  return '#E2E8F0';
}

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState<LoginForm>({ correo: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof LoginForm>(field: K, value: LoginForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => clearFieldError(prev, field));
    setSubmitError('');
  }

  async function handleLogin() {
    const nextErrors = validateLogin(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError('');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await iniciarSesion({ correo: form.correo.trim(), password: form.password, rol: 'cliente' });
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, 'No pudimos iniciar sesión. Verifica tus datos.'));
    } finally {
      setSubmitting(false);
    }
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
            <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>
              Ingresa tus credenciales para continuar
            </Text>

            <FormErrorBanner errors={errors} />

            {!!submitError && (
              <View style={{
                backgroundColor: COLORS.errorBg,
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#FECACA',
              }}>
                <Text style={{ color: COLORS.error, fontSize: 13, fontWeight: '600' }}>
                  {submitError}
                </Text>
              </View>
            )}

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B46', marginBottom: 8 }}>
              Correo electrónico <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <View style={{
              flexDirection:     'row',
              alignItems:        'center',
              backgroundColor:   errors.correo ? '#FEF2F2' : '#F8FAFC',
              borderRadius:      14,
              borderWidth:       1.5,
              borderColor:       inputBorderColor(!!form.correo, !!errors.correo),
              paddingHorizontal: 16,
              marginBottom:      errors.correo ? 6 : 20,
              height:            54,
            }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>✉️</Text>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F2B46' }}
                placeholder="correo@empresa.com"
                placeholderTextColor="#CBD5E1"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.correo}
                onChangeText={(text) => updateField('correo', text)}
              />
            </View>
            <FieldErrorText message={errors.correo} />
            <View style={{ marginBottom: errors.correo ? 14 : 0 }} />

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B46', marginBottom: 8 }}>
              Contraseña <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <View style={{
              flexDirection:     'row',
              alignItems:        'center',
              backgroundColor:   errors.password ? '#FEF2F2' : '#F8FAFC',
              borderRadius:      14,
              borderWidth:       1.5,
              borderColor:       inputBorderColor(!!form.password, !!errors.password),
              paddingHorizontal: 16,
              marginBottom:      errors.password ? 6 : 32,
              height:            54,
            }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>🔒</Text>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F2B46' }}
                placeholder="••••••••"
                placeholderTextColor="#CBD5E1"
                secureTextEntry={!showPass}
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '👁️' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <FieldErrorText message={errors.password} />
            <View style={{ marginBottom: errors.password ? 18 : 0 }} />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#CBD5E1' : '#E8712A',
                borderRadius:    16,
                height:          56,
                alignItems:      'center',
                justifyContent:  'center',
                shadowColor:     '#E8712A',
                shadowOpacity:   0.4,
                shadowRadius:    12,
                elevation:       6,
                marginTop:       8,
              }}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
                    Iniciar Sesión
                  </Text>
              }
            </TouchableOpacity>

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
