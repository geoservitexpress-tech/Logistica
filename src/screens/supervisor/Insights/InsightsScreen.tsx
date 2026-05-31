// src/screens/supervisor/Insights/InsightsScreen.tsx

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
import styles from './InsightsScreen.styles';

interface InsightStats {
  total:       number;
  entregados:  number;
  enCamino:    number;
  pendientes:  number;
  cancelados:  number;
  tasaExito:   number;
}

export default function InsightsScreen() {
  const [stats,      setStats]      = useState<InsightStats>({
    total: 0, entregados: 0, enCamino: 0, pendientes: 0, cancelados: 0, tasaExito: 0,
  });
  const [cargando,   setCargando]   = useState<boolean>(false);
  const [refrescando,setRefrescando]= useState<boolean>(false);

  const fetchInsights = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      const lista = Array.isArray(data) ? data : [];
      const entregados = lista.filter((p: Record<string, string>) =>
        p.estadoPedido?.toLowerCase().includes('entregado')).length;
      const s: InsightStats = {
        total:      lista.length,
        entregados,
        enCamino:   lista.filter((p: Record<string, string>) =>
          p.estadoPedido?.toLowerCase().includes('camino')).length,
        pendientes: lista.filter((p: Record<string, string>) =>
          p.estadoPedido?.toLowerCase().includes('pendiente') ||
          p.estadoPedido?.toLowerCase().includes('creado')).length,
        cancelados: lista.filter((p: Record<string, string>) =>
          p.estadoPedido?.toLowerCase().includes('cancelado')).length,
        tasaExito:  lista.length > 0 ? Math.round((entregados / lista.length) * 100) : 0,
      };
      setStats(s);
    } catch (e) {
      console.log('Error insights', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchInsights(); }, [fetchInsights]));

  const metricCards = [
    { label: 'Total Pedidos',  value: stats.total,      icon: '[P]', bg: '#0F2B46', text: '#fff' },
    { label: 'Entregados',     value: stats.entregados, icon: '[OK]', bg: '#DCFCE7', text: '#16A34A' },
    { label: 'En Camino',      value: stats.enCamino,   icon: '[C]',  bg: '#DBEAFE', text: '#2563EB' },
    { label: 'Pendientes',     value: stats.pendientes, icon: '[W]',  bg: '#FEF3C7', text: '#D97706' },
    { label: 'Cancelados',     value: stats.cancelados, icon: '[X]',  bg: '#FEE2E2', text: '#DC2626' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => fetchInsights(true)}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSubtitle}>Estadisticas de pedidos</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* TASA DE EXITO */}
          <View style={styles.tasaCard}>
            <Text style={styles.tasaLabel}>Tasa de Exito</Text>
            <Text style={styles.tasaValue}>{stats.tasaExito}%</Text>
            <View style={styles.tasaBar}>
              <View style={[styles.tasaFill, { width: `${stats.tasaExito}%` as `${number}%` }]} />
            </View>
            <Text style={styles.tasaSub}>
              {stats.entregados} de {stats.total} pedidos entregados
            </Text>
          </View>

          {/* METRICAS */}
          <Text style={styles.sectionTitle}>Desglose por estado</Text>
          <View style={styles.metricsGrid}>
            {metricCards.map((card) => (
              <View key={card.label} style={[styles.metricCard, { backgroundColor: card.bg }]}>
                <Text style={styles.metricIcon}>{card.icon}</Text>
                <Text style={[styles.metricValue, { color: card.text }]}>{card.value}</Text>
                <Text style={[styles.metricLabel, { color: card.text }]}>{card.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}