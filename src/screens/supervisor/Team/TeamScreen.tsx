// src/screens/supervisor/Team/TeamScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './TeamScreen.styles';

interface RepartidorStats {
  idUsuario:  string;
  nombres:    string;
  apellidos:  string;
  asignados:  number;
  entregados: number;
  enCamino:   number;
}

export default function TeamScreen() {
  const [repartidores, setRepartidores] = useState<RepartidorStats[]>([]);
  const [cargando,     setCargando]     = useState<boolean>(false);
  const [refrescando,  setRefrescando]  = useState<boolean>(false);

  const fetchTeam = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [resUsuarios, resPedidos] = await Promise.all([
        apiClient.get(ENDPOINTS.USERS.GET_ALL),
        apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL),
      ]);

      const usuarios = Array.isArray(resUsuarios.data) ? resUsuarios.data : [];
      const pedidos  = Array.isArray(resPedidos.data)  ? resPedidos.data  : [];

      const reps = usuarios.filter((u: Record<string, unknown>) =>
        (u.roles as string[] | undefined)?.some((r) => r.toLowerCase().includes('repartidor')) ||
        (u.rol as string | undefined)?.toLowerCase().includes('repartidor'),
      );

      const stats: RepartidorStats[] = reps.map((rep: Record<string, string>) => {
        const misPedidos = pedidos.filter(
          (p: Record<string, string>) => p.usuarioRepartidor === `${rep.nombres} ${rep.apellidos}`,
        );
        return {
          idUsuario:  rep.idUsuario,
          nombres:    rep.nombres,
          apellidos:  rep.apellidos,
          asignados:  misPedidos.length,
          entregados: misPedidos.filter((p: Record<string, string>) =>
            p.estadoPedido?.toLowerCase().includes('entregado')).length,
          enCamino:   misPedidos.filter((p: Record<string, string>) =>
            p.estadoPedido?.toLowerCase().includes('camino')).length,
        };
      });

      setRepartidores(stats);
    } catch (e) {
      console.log('Error team', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchTeam(); }, [fetchTeam]));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => fetchTeam(true)}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team</Text>
        <Text style={styles.headerSubtitle}>Progreso de repartidores hoy</Text>
      </View>

      {cargando && (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      )}

      {!cargando && repartidores.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No hay repartidores registrados</Text>
        </View>
      )}

      {!cargando && repartidores.map((rep) => {
        const progreso = rep.asignados > 0
          ? Math.round((rep.entregados / rep.asignados) * 100)
          : 0;

        return (
          <View key={rep.idUsuario} style={styles.repCard}>
            <View style={styles.repHeader}>
              <View style={styles.repAvatar}>
                <Text style={styles.repAvatarText}>
                  {rep.nombres?.charAt(0)?.toUpperCase() ?? 'R'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.repNombre}>{rep.nombres} {rep.apellidos}</Text>
                <Text style={styles.repRol}>Repartidor</Text>
              </View>
              <View style={[
                styles.repStatusBadge,
                { backgroundColor: rep.enCamino > 0 ? '#DBEAFE' : '#F3F4F6' },
              ]}>
                <Text style={[
                  styles.repStatusText,
                  { color: rep.enCamino > 0 ? '#2563EB' : '#6B7280' },
                ]}>
                  {rep.enCamino > 0 ? 'En ruta' : 'Disponible'}
                </Text>
              </View>
            </View>

            {/* STATS */}
            <View style={styles.repStats}>
              <View style={styles.repStatItem}>
                <Text style={styles.repStatValue}>{rep.asignados}</Text>
                <Text style={styles.repStatLabel}>Asignados</Text>
              </View>
              <View style={styles.repStatItem}>
                <Text style={[styles.repStatValue, { color: '#2563EB' }]}>{rep.enCamino}</Text>
                <Text style={styles.repStatLabel}>En camino</Text>
              </View>
              <View style={styles.repStatItem}>
                <Text style={[styles.repStatValue, { color: '#16A34A' }]}>{rep.entregados}</Text>
                <Text style={styles.repStatLabel}>Entregados</Text>
              </View>
            </View>

            {/* PROGRESO */}
            <View style={styles.progresoWrap}>
              <View style={styles.progresoBar}>
                <View style={[styles.progresoFill, { width: `${progreso}%` as `${number}%` }]} />
              </View>
              <Text style={styles.progresoText}>{progreso}%</Text>
            </View>
          </View>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}