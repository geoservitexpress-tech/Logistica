// src/screens/auth/Register/RegisterScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import AppInput from '@/components/forms/AppInput';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import type { RegisterScreenProps } from './RegisterScreen.types';
import { styles } from './RegisterScreen.styles';

// UUIDs fijos del backend
const ROL_ID_CLIENTE             = 1;
const TIPO_DOCUMENTO_ID_REGISTRO = 1;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { registrar, loading } = useAuth();

  const [nombres,          setNombres]          = useState<string>('');
  const [apellidos,        setApellidos]        = useState<string>('');
  const [correo,           setCorreo]           = useState<string>('');
  const [telefono,         setTelefono]         = useState<string>('');
  const [documento,        setDocumento]        = useState<string>('');
  const [password,         setPassword]         = useState<string>('');
  const [confirmarPass,    setConfirmarPass]    = useState<string>('');
  const [terminos,         setTerminos]         = useState<boolean>(false);

  async function handleRegister() {
    if (!nombres || !apellidos || !correo || !telefono || !documento || !password) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Contrasena invalida', 'La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmarPass) {
      Alert.alert('Contrasenas no coinciden', 'Las contrasenas deben ser iguales.');
      return;
    }

    if (!terminos) {
      Alert.alert('Terminos', 'Debes aceptar los terminos.');
      return;
    }

    await registrar({
      nombres,
      apellidos,
      correo,
      telefono,
      documento,
      password,
      fkTipoDocumento: TIPO_DOCUMENTO_ID_REGISTRO,
      idRol:           ROL_ID_CLIENTE,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'<-'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>GLOBALLOGISTICS</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>Crea tu cuenta</Text>
          <Text style={styles.subtitulo}>
            Completa tus datos para registrarte como cliente.
          </Text>

          <AppInput
            label="Nombres"
            placeholder="Maria"
            value={nombres}
            onChangeText={setNombres}
          />

          <AppInput
            label="Apellidos"
            placeholder="Perez"
            value={apellidos}
            onChangeText={setApellidos}
          />

          <AppInput
            label="Numero de Documento (CC)"
            placeholder="1020304050"
            value={documento}
            onChangeText={setDocumento}
            keyboardType="numeric"
          />

          <AppInput
            label="Correo Electronico"
            placeholder="correo@empresa.com"
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppInput
            label="Telefono"
            placeholder="+57 300 123 4567"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <AppInput
            label="Contrasena"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AppInput
            label="Confirmar Contrasena"
            placeholder="Repite tu contrasena"
            value={confirmarPass}
            onChangeText={setConfirmarPass}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTerminos(!terminos)}
          >
            <View style={[styles.checkbox, terminos && styles.checkboxActive]} />
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink}>Terminos y Condiciones</Text>
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}> Inicia sesion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;