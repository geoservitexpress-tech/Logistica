// src/screens/admin/Usuarios/UsuariosScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@/api';
import { COLORS } from '@/theme';
import styles from './UsuariosScreen.styles';

const ROLES_DISPONIBLES = [
  { id: 1, nombre: 'Cliente' },
  { id: 2, nombre: 'Repartidor' },
  { id: 3, nombre: 'Administrador' },
  { id: 4, nombre: 'Supervisor' },
];

const COLORES_ROL: Record<string, { bg: string; text: string }> = {
  cliente:       { bg: '#F3F4F6', text: '#6B7280' },
  repartidor:    { bg: '#DBEAFE', text: '#2563EB' },
  administrador: { bg: '#FEE2E2', text: '#DC2626' },
  supervisor:    { bg: '#EDE9FE', text: '#7C3AED' },
};

const COLORES_AVATAR = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

interface Usuario {
  idUsuario: number;
  nombres:   string;
  apellidos: string;
  correo:    string;
  roles:     { idRol: number; nombre: string }[];
}

export default function UsuariosScreen() {
  const [busqueda,    setBusqueda]    = useState<string>('');
  const [usuarios,    setUsuarios]    = useState<Usuario[]>([]);
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const fetchUsuarios = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get('/admin/usuarios');
      const lista = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      // Excluir administradores
      setUsuarios(lista.filter((u: Usuario) =>
        !u.roles.some((r) => r.nombre.toLowerCase() === 'administrador')
      ));
    } catch (e) {
      console.log('Error usuarios', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsuarios(); }, [fetchUsuarios]));

  const filtrados = usuarios.filter((u) =>
    `${u.nombres} ${u.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const cambiarRol = (usuario: Usuario): void => {
    const rolActual = usuario.roles[0]?.nombre ?? 'Sin rol';
    Alert.alert(
      `Cambiar rol`,
      `Usuario: ${usuario.nombres} ${usuario.apellidos}\nRol actual: ${rolActual}`,
      [
        ...ROLES_DISPONIBLES.map((rol) => ({
          text: rol.nombre,
          onPress: async () => {
            try {
              await apiClient.patch(`/admin/usuarios/${usuario.idUsuario}/roles`, {
                idsRol: [rol.id],
              });
              setUsuarios((prev) =>
                prev.map((u) =>
                  u.idUsuario === usuario.idUsuario
                    ? { ...u, roles: [{ idRol: rol.id, nombre: rol.nombre }] }
                    : u,
                ),
              );
              Alert.alert('✅ Rol actualizado', `${usuario.nombres} ahora es ${rol.nombre}`);
            } catch (e) {
              Alert.alert('Error', 'No se pudo cambiar el rol.');
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
        <Text style={styles.headerTitle}>Usuarios</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => fetchUsuarios(true)} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.pageTitle}>Gestión de Usuarios</Text>
        <Text style={styles.pageSubtitle}>Administra los usuarios y sus roles en el sistema.</Text>

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

        {filtrados.map((usuario, idx) => {
          const rolNombre = usuario.roles[0]?.nombre?.toLowerCase() ?? 'cliente';
          const cfg       = COLORES_ROL[rolNombre] ?? { bg: '#F3F4F6', text: '#6B7280' };
          const bgAvatar  = COLORES_AVATAR[idx % COLORES_AVATAR.length];
          return (
            <View key={usuario.idUsuario} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: bgAvatar }]}>
                  <Text style={styles.avatarText}>{usuario.nombres.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{usuario.nombres} {usuario.apellidos}</Text>
                  <Text style={styles.correo}>{usuario.correo}</Text>
                </View>
              </View>

              <View style={[styles.rolBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.rolText, { color: cfg.text }]}>
                  {rolNombre.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cambiarRolBtn}
                onPress={() => cambiarRol(usuario)}
              >
                <Text style={styles.cambiarRolText}>Cambiar Rol</Text>
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
}