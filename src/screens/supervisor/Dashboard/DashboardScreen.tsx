// src/screens/supervisor/Dashboard/DashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { apiClient, ENDPOINTS } from '@/api';
import styles from './DashboardScreen.styles';
import { COLORS } from '@/theme';

interface Stats {
  total:     number;
  creados:   number;
  enCamino:  number;
  entregados: number;
  cancelados: number;
}

export default function DashboardScreen() {
  const { usuario } = useAuth();
  const [stats,      setStats]      = useState<Stats>({ total: 0, creados: 0, enCamino: 0, entregados: 0, cancelados: 0 });
  const [cargando,   setCargando]   = useState<boolean>(false);
  const [refrescando,setRefrescando]= useState<boolean>(false);

  const fetchStats = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      const lista = Array.isArray(data) ? data : [];
      const s: Stats = {
        total:      lista.length,
        creados:    lista.filter((p: Record<string, string>) => p.estadoPedido?.toLowerCase().includes('creado')).length,
        enCamino:   lista.filter((p: Record<string, string>) => p.estadoPedido?.toLowerCase().includes('camino')).length,
        entregados: lista.filter((p: Record<string, string>) => p.estadoPedido?.toLowerCase().includes('entregado')).length,
        cancelados: lista.filter((p: Record<string, string>) => p.estadoPedido?.toLowerCase().includes('cancelado')).length,
      };
      setStats(s);
    } catch (e) {
      console.log('Error stats', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchStats(); }, [fetchStats]));

  const statCards = [
    { label: 'Total',      value: stats.total,      bg: '#0F2B46', text: '#fff' },
    { label: 'Creados',    value: stats.creados,    bg: '#F3F4F6', text: '#6B7280' },
    { label: 'En Camino',  value: stats.enCamino,   bg: '#DBEAFE', text: '#2563EB' },
    { label: 'Entregados', value: stats.entregados, bg: '#DCFCE7', text: '#16A34A' },
    { label: 'Cancelados', value: stats.cancelados, bg: '#FEE2E2', text: '#DC2626' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => fetchStats(true)}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Logistics Supervisor</Text>
          <Text style={styles.subtitle}>
            Hola, {usuario?.nombres ?? 'Supervisor'}
          </Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {usuario?.nombres?.charAt(0)?.toUpperCase() ?? 'S'}
          </Text>
        </View>
      </View>

      {/* SUBTITLE */}
      <Text style={styles.sectionTitle}>Resumen del dia</Text>
      <Text style={styles.sectionSubtitle}>Monitoreo en tiempo real de pedidos activos</Text>

      {/* STATS */}
      {cargando ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <Text style={[styles.statValue, { color: card.text }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: card.text }]}>{card.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ACCESOS RAPIDOS */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Accesos rapidos</Text>
      <View style={styles.quickGrid}>
        {[
          { label: 'Ver Pedidos',    icon: '[O]' },
          { label: 'Ver Equipo',     icon: '[T]' },
          { label: 'Estadisticas',   icon: '[I]' },
        ].map((item) => (
          <View key={item.label} style={styles.quickCard}>
            <Text style={styles.quickIcon}>{item.icon}</Text>
            <Text style={styles.quickLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}