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
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import styles from './InsightsScreen.styles';

interface InsightStats {
  total:        number;
  entregados:   number;
  enReparto:    number;
  asignados:    number;
  noEntregados: number;
  creados:      number;
  tasaExito:    number;
}

export default function InsightsScreen() {
  const { usuario } = useAuth();
  const [stats,       setStats]       = useState<InsightStats>({
    total: 0, entregados: 0, enReparto: 0, asignados: 0,
    noEntregados: 0, creados: 0, tasaExito: 0,
  });
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const fetchInsights = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [resTodos, resReparto] = await Promise.all([
        apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL),
        apiClient.get('/supervisor/pedidos/en-reparto'),
      ]);
      const lista   = Array.isArray(resTodos.data)   ? resTodos.data   : Array.isArray(resTodos.data?.items)   ? resTodos.data.items   : [];
      const reparto = Array.isArray(resReparto.data) ? resReparto.data : Array.isArray(resReparto.data?.items) ? resReparto.data.items : [];
      const entregados = lista.filter((p: Record<string, unknown>) => p.idEstadoPedido === 5).length;

      setStats({
        total:        lista.length,
        entregados,
        enReparto:    reparto.length,
        asignados:    lista.filter((p: Record<string, unknown>) => p.idEstadoPedido === 2).length,
        noEntregados: lista.filter((p: Record<string, unknown>) => p.idEstadoPedido === 7).length,
        creados:      lista.filter((p: Record<string, unknown>) => p.idEstadoPedido === 1).length,
        tasaExito:    lista.length > 0 ? Math.round((entregados / lista.length) * 100) : 0,
      });
    } catch (e) {
      console.log('Error insights', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchInsights(); }, [fetchInsights]));

  const hora    = new Date().getHours();
  const saludo  = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';
  const inicial = usuario?.nombres?.charAt(0)?.toUpperCase() ?? 'S';

  const metricCards = [
    { label: 'Total Pedidos',   value: stats.total,        icon: '📦', bg: '#0F2B46', text: '#fff'     },
    { label: 'En Reparto',      value: stats.enReparto,    icon: '🚚', bg: '#DBEAFE', text: '#2563EB'  },
    { label: 'Entregados',      value: stats.entregados,   icon: '✅', bg: '#DCFCE7', text: '#16A34A'  },
    { label: 'Asignados',       value: stats.asignados,    icon: '📋', bg: '#FEF3C7', text: '#D97706'  },
    { label: 'No Entregados',   value: stats.noEntregados, icon: '❌', bg: '#FEE2E2', text: '#DC2626'  },
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
      {/* HEADER */}
      <View style={{
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   8,
      }}>
        <View>
          <Text style={styles.headerTitle}>Estadísticas</Text>
          <Text style={styles.headerSubtitle}>
            {saludo}, {usuario?.nombres ?? 'Supervisor'} 👋
          </Text>
        </View>
        <View style={{
          width:           44,
          height:          44,
          borderRadius:    22,
          backgroundColor: COLORS.primary,
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{inicial}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 20 }}>
        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {cargando ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* TASA DE ÉXITO */}
          <View style={styles.tasaCard}>
            <Text style={styles.tasaLabel}>Tasa de Éxito</Text>
            <Text style={styles.tasaValue}>{stats.tasaExito}%</Text>
            <View style={styles.tasaBar}>
              <View style={[styles.tasaFill, { width: `${stats.tasaExito}%` as `${number}%` }]} />
            </View>
            <Text style={styles.tasaSub}>
              {stats.entregados} de {stats.total} pedidos entregados
            </Text>
          </View>

          {/* MÉTRICAS */}
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

          {/* PEDIDOS PENDIENTES */}
          {stats.creados > 0 && (
            <View style={{
              backgroundColor: '#FEF3C7',
              borderRadius:    12,
              padding:         16,
              marginTop:       16,
              flexDirection:   'row',
              alignItems:      'center',
              gap:             12,
            }}>
              <Text style={{ fontSize: 24 }}>⚠️</Text>
              <View>
                <Text style={{ fontWeight: '700', color: '#92400E', fontSize: 14 }}>
                  {stats.creados} pedido{stats.creados > 1 ? 's' : ''} sin asignar
                </Text>
                <Text style={{ color: '#B45309', fontSize: 12, marginTop: 2 }}>
                  Esperando asignación de repartidor
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}