// src/screens/auth/Register/RegisterScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import FormErrorBanner, { FieldErrorText } from '@/components/feedback/FormErrorBanner/FormErrorBanner';
import { clearFieldError, getApiErrorMessage } from '@/utils/helpers';
import { validateRegister } from '@/utils/validators';
import type { FieldErrors } from '@/utils/validators';
import type { RegisterScreenProps } from './RegisterScreen.types';

const ROL_ID_CLIENTE             = 1;
const TIPO_DOCUMENTO_ID_REGISTRO = 1;

interface CampoProps {
  label:         string;
  placeholder:   string;
  value:         string;
  onChangeText:  (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secure?:       boolean;
  showToggle?:   boolean;
  onToggle?:     () => void;
  required?:     boolean;
  error?:        string;
}

function Campo({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secure,
  showToggle,
  onToggle,
  required,
  error,
}: CampoProps) {
  const borderColor = error ? COLORS.error : value ? '#E8712A' : '#E2E8F0';

  return (
    <View style={{ marginBottom: error ? 6 : 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B46', marginBottom: 6 }}>
        {label}
        {required && <Text style={{ color: COLORS.error }}> *</Text>}
      </Text>
      <View style={{
        flexDirection:     'row',
        alignItems:        'center',
        backgroundColor:   error ? '#FEF2F2' : '#F8FAFC',
        borderRadius:      12,
        borderWidth:       1.5,
        borderColor,
        paddingHorizontal: 14,
        height:            50,
      }}>
        <TextInput
          style={{ flex: 1, fontSize: 14, color: '#0F2B46' }}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'default'}
          secureTextEntry={secure && !showToggle}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secure && (
          <TouchableOpacity onPress={onToggle}>
            <Text style={{ fontSize: 16 }}>{showToggle ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <FieldErrorText message={error} />
    </View>
  );
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { registrar, loading } = useAuth();

  const [nombres,       setNombres]       = useState('');
  const [apellidos,     setApellidos]     = useState('');
  const [correo,        setCorreo]        = useState('');
  const [telefono,      setTelefono]      = useState('');
  const [documento,     setDocumento]     = useState('');
  const [password,      setPassword]      = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [terminos,      setTerminos]      = useState(false);
  const [showPass,      setShowPass]      = useState(false);
  const [showPass2,     setShowPass2]     = useState(false);
  const [errors,        setErrors]        = useState<FieldErrors>({});
  const [submitError,   setSubmitError]   = useState('');

  function updateField(field: string, value: string) {
    const setters: Record<string, (v: string) => void> = {
      nombres: setNombres,
      apellidos: setApellidos,
      correo: setCorreo,
      telefono: setTelefono,
      documento: setDocumento,
      password: setPassword,
      confirmarPass: setConfirmarPass,
    };
    setters[field]?.(value);
    setErrors((prev) => clearFieldError(prev, field));
    setSubmitError('');
  }

  async function handleRegister() {
    const nextErrors = validateRegister({
      nombres,
      apellidos,
      correo,
      telefono,
      documento,
      password,
      confirmarPass,
      terminos,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError('');
      return;
    }

    try {
      setSubmitError('');
      await registrar({
        nombres,
        apellidos,
        correo: correo.trim(),
        telefono,
        documento,
        password,
        fkTipoDocumento: TIPO_DOCUMENTO_ID_REGISTRO,
        idRol:           ROL_ID_CLIENTE,
      });
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
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
            paddingTop:        Platform.OS === 'ios' ? 56 : 40,
            paddingBottom:     28,
            paddingHorizontal: 24,
            flexDirection:     'row',
            alignItems:        'center',
            gap:               16,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width:           40,
                height:          40,
                borderRadius:    20,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems:      'center',
                justifyContent:  'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Crear cuenta</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>GeoServit Express</Text>
            </View>
          </View>

          <View style={{
            flex:                 1,
            backgroundColor:      '#fff',
            borderTopLeftRadius:  36,
            borderTopRightRadius: 36,
            paddingHorizontal:    24,
            paddingTop:           32,
            paddingBottom:        48,
          }}>
            <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>
              Completa tus datos para registrarte como cliente.
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

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Nombres"
                  placeholder="María"
                  value={nombres}
                  onChangeText={(v) => updateField('nombres', v)}
                  required
                  error={errors.nombres}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Apellidos"
                  placeholder="Pérez"
                  value={apellidos}
                  onChangeText={(v) => updateField('apellidos', v)}
                  required
                  error={errors.apellidos}
                />
              </View>
            </View>

            <Campo
              label="Número de Documento (CC)"
              placeholder="1020304050"
              value={documento}
              onChangeText={(v) => updateField('documento', v)}
              keyboardType="numeric"
              required
              error={errors.documento}
            />

            <Campo
              label="Correo electrónico"
              placeholder="correo@empresa.com"
              value={correo}
              onChangeText={(v) => updateField('correo', v)}
              keyboardType="email-address"
              required
              error={errors.correo}
            />

            <Campo
              label="Teléfono"
              placeholder="+57 300 123 4567"
              value={telefono}
              onChangeText={(v) => updateField('telefono', v)}
              keyboardType="phone-pad"
              required
              error={errors.telefono}
            />

            <Campo
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={(v) => updateField('password', v)}
              secure
              showToggle={showPass}
              onToggle={() => setShowPass(!showPass)}
              required
              error={errors.password}
            />

            <Campo
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmarPass}
              onChangeText={(v) => updateField('confirmarPass', v)}
              secure
              showToggle={showPass2}
              onToggle={() => setShowPass2(!showPass2)}
              required
              error={errors.confirmarPass}
            />

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: errors.terminos ? 8 : 28 }}
              onPress={() => {
                setTerminos(!terminos);
                setErrors((prev) => clearFieldError(prev, 'terminos'));
                setSubmitError('');
              }}
            >
              <View style={{
                width:           22,
                height:          22,
                borderRadius:    6,
                borderWidth:     2,
                borderColor:     errors.terminos ? COLORS.error : terminos ? '#E8712A' : '#E2E8F0',
                backgroundColor: terminos ? '#E8712A' : 'transparent',
                alignItems:      'center',
                justifyContent:  'center',
              }}>
                {terminos && <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>}
              </View>
              <Text style={{ flex: 1, color: '#64748B', fontSize: 13 }}>
                Acepto los{' '}
                <Text style={{ color: '#E8712A', fontWeight: '700' }}>Términos y Condiciones</Text>
              </Text>
            </TouchableOpacity>
            <FieldErrorText message={errors.terminos} />
            <View style={{ marginBottom: errors.terminos ? 20 : 0 }} />

            <TouchableOpacity
              onPress={handleRegister}
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
                : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Crear Cuenta</Text>
              }
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: '#E8712A', fontWeight: '700', fontSize: 14 }}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
