// src/screens/admin/Roles/RolesScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './RolesScreen.styles';

interface Usuario {
  idUsuario: number;
  nombres:   string;
  apellidos: string;
  correo:    string;
  roles:     string[];
}

const ROLES_DISPONIBLES = [
  { id: 1, nombre: 'Cliente',        color: '#6B7280' },
  { id: 2, nombre: 'Repartidor',     color: '#2563EB' },
  { id: 3, nombre: 'Administrador',  color: '#DC2626' },
  { id: 4, nombre: 'Supervisor',     color: '#7C3AED' },
];

const COLORES_ROL: Record<string, string> = {
  cliente:       '#6B7280',
  repartidor:    '#2563EB',
  administrador: '#DC2626',
  supervisor:    '#7C3AED',
};

function getColorRol(rol: string): string {
  return COLORES_ROL[rol.toLowerCase()] ?? '#6B7280';
}

export default function RolesScreen() {
  const [usuarios,    setUsuarios]    = useState<Usuario[]>([]);
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [busqueda,    setBusqueda]    = useState<string>('');
  const [asignando,   setAsignando]   = useState<number | null>(null);

  const fetchUsuarios = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      // Como no hay endpoint de usuarios usamos los del historial
      // Cuando haya endpoint lo conectamos
      setUsuarios([]);
    } catch (e) {
      console.log('Error usuarios', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsuarios(); }, [fetchUsuarios]));

  const cambiarRol = (usuario: Usuario): void => {
    Alert.alert(
      `Cambiar rol de ${usuario.nombres}`,
      'Selecciona el nuevo rol:',
      [
        ...ROLES_DISPONIBLES.map((rol) => ({
          text: rol.nombre,
          onPress: async () => {
            setAsignando(usuario.idUsuario);
            try {
              // Endpoint pendiente — cuando esté disponible lo conectamos
              Alert.alert('Rol actualizado', `${usuario.nombres} ahora es ${rol.nombre}`);
            } catch (e) {
              Alert.alert('Error', 'No se pudo cambiar el rol.');
            } finally {
              setAsignando(null);
            }
          },
        })),
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Roles</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => fetchUsuarios(true)} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.pageTitle}>Usuarios y Roles</Text>
        <Text style={styles.pageSubtitle}>Asigna y gestiona los roles de los usuarios del sistema.</Text>

        {/* STATS ROLES */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {ROLES_DISPONIBLES.map((rol) => (
            <View key={rol.id} style={[styles.kpiCard, { flex: 1, minWidth: '45%', padding: 12 }]}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: rol.color + '20',
                alignItems: 'center', justifyContent: 'center', marginBottom: 6,
              }}>
                <Text style={{ fontSize: 16 }}>
                  {rol.id === 1 ? '👤' : rol.id === 2 ? '🚚' : rol.id === 3 ? '⚙️' : '👁️'}
                </Text>
              </View>
              <Text style={[styles.kpiLabel, { color: rol.color }]}>{rol.nombre.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* BUSQUEDA */}
        <View style={styles.searchWrap}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuario..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* MENSAJE PENDIENTE */}
        <View style={[styles.tableCard, { alignItems: 'center', paddingVertical: 40 }]}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚙️</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 8 }}>
            Endpoint en desarrollo
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' }}>
            La gestión de roles estará disponible cuando el backend exponga el endpoint de usuarios.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}