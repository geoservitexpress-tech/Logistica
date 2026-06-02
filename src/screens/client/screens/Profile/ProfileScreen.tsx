// src/screens/client/screens/Profile/ProfileScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  AlertButton,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { apiClient, ENDPOINTS } from '@/api';
import s from './ProfileScreen.styles';

export default function ProfileScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const [fotoPerfil,  setFotoPerfil]  = useState<string | null>(null);
  const [totalEnvios, setTotalEnvios] = useState<number>(0);
  const [entregados,  setEntregados]  = useState<number>(0);

  const inicial        = usuario?.nombres?.charAt(0)?.toUpperCase() ?? 'U';
  const esRepartidor   = usuario?.rol === 'repartidor';
  const esSupervisor   = usuario?.rol === 'supervisor';
  const esAdmin        = usuario?.rol === 'administrador';
  const mostrarStats   = !esSupervisor && !esAdmin;

  useFocusEffect(
    useCallback(() => {
      if (!mostrarStats) return;
      const fetchStats = async () => {
        try {
          if (esRepartidor) {
            const { data } = await apiClient.get('/repartidor/pedidos');
            const lista = Array.isArray(data) ? data : [];
            setTotalEnvios(lista.length);
            setEntregados(lista.filter((p: Record<string, unknown>) =>
              (p.idEstadoPedido as number) === 5
            ).length);
          } else {
            const idUsuario = usuario?.idUsuario;
            const url = idUsuario
              ? `${ENDPOINTS.PEDIDOS.GET_ALL}?idUsuario=${idUsuario}`
              : ENDPOINTS.PEDIDOS.GET_ALL;
            const { data } = await apiClient.get(url);
            const lista = Array.isArray(data) ? data : [];
            setTotalEnvios(lista.length);
            setEntregados(lista.filter((p: Record<string, unknown>) =>
              (p.idEstadoPedido as number) === 5
            ).length);
          }
        } catch (e) {
          console.log('Error stats perfil', e);
        }
      };
      fetchStats();
    }, [usuario?.idUsuario, usuario?.rol, mostrarStats]),
  );

  const handleCerrarSesion = (): void => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, salir', style: 'destructive', onPress: cerrarSesion },
      ],
    );
  };

  const cambiarFoto = (): void => {
    const opciones: AlertButton[] = [
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8, allowsEditing: true, aspect: [1, 1],
          });
          if (!result.canceled) setFotoPerfil(result.assets[0].uri);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8, allowsEditing: true, aspect: [1, 1],
          });
          if (!result.canceled) setFotoPerfil(result.assets[0].uri);
        },
      },
    ];
    if (fotoPerfil) {
      opciones.push({
        text: 'Eliminar foto',
        style: 'destructive',
        onPress: () => setFotoPerfil(null),
      });
    }
    opciones.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto de perfil', 'Selecciona una opción', opciones);
  };

  const statLabel1 = esRepartidor ? 'ASIGNADOS' : 'ENVÍOS';

  return (
    <View style={s.container}>

      {/* TOP BAR */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.topIconBtn}>
          <Text style={{ fontSize: 20 }}>☰</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>GLOBALLOGISTICS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* AVATAR */}
        <View style={s.avatarCard}>
          <TouchableOpacity style={s.avatarWrap} onPress={cambiarFoto} activeOpacity={0.85}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={s.avatarImg} />
            ) : (
              <View style={s.avatarCircle}>
                <Text style={s.avatarText}>{inicial}</Text>
              </View>
            )}
            <View style={s.editBtn}>
              <Text style={s.editIcon}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={s.userName}>
            {usuario?.nombres ?? 'Usuario'} {usuario?.apellidos ?? ''}
          </Text>
          <Text style={s.userRol}>{usuario?.rol ?? 'Cliente'}</Text>

          <View style={s.verificado}>
            <Text>✅</Text>
            <Text style={s.verificadoTxt}>CUENTA VERIFICADA</Text>
          </View>
        </View>

        {/* STATS — solo para cliente y repartidor */}
        {mostrarStats && (
          <View style={s.statsRow}>
            <View style={[s.statCard, s.statCardDark]}>
              <Text style={s.statEmoji}>📦</Text>
              <Text style={s.statValDark}>{totalEnvios}</Text>
              <Text style={s.statLabelDark}>{statLabel1}</Text>
            </View>
            <View style={[s.statCard, s.statCardLight]}>
              <Text style={s.statEmoji}>✅</Text>
              <Text style={s.statValLight}>{entregados}</Text>
              <Text style={s.statLabelLight}>ENTREGADOS</Text>
            </View>
          </View>
        )}

        {/* LOGOUT */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleCerrarSesion} activeOpacity={0.85}>
          <Text>🚪</Text>
          <Text style={s.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}