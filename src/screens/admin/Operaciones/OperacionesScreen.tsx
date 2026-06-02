// src/screens/admin/Operaciones/OperacionesScreen.tsx

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
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './OperacionesScreen.styles';

const TARIFA_POR_ENTREGA = 5000;
const COLORES_AVATAR = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

interface RepartidorStats {
  nombre:      string;
  entregas:    number;
  pago:        number;
}

export default function OperacionesScreen() {
  const [repartidores,  setRepartidores]  = useState<RepartidorStats[]>([]);
  const [cargando,      setCargando]      = useState<boolean>(false);
  const [refrescando,   setRefrescando]   = useState<boolean>(false);
  const [busqueda,      setBusqueda]      = useState<string>('');

  const fetchData = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      const pedidos  = Array.isArray(data) ? data : [];

      const mapa = new Map<string, RepartidorStats>();
      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioRepartidor === 'string' ? p.usuarioRepartidor : null;
        if (!nombre) return;
        if (!mapa.has(nombre)) mapa.set(nombre, { nombre, entregas: 0, pago: 0 });
        const rep = mapa.get(nombre)!;
        if ((p.idEstadoPedido as number) === 5) {
          rep.entregas++;
          rep.pago += TARIFA_POR_ENTREGA;
        }
      });

      setRepartidores(Array.from(mapa.values()));
    } catch (e) {
      console.log('Error operaciones', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const filtrados = repartidores.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPago      = repartidores.reduce((acc, r) => acc + r.pago, 0);
  const totalEntregas  = repartidores.reduce((acc, r) => acc + r.entregas, 0);

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
        <Text style={styles.headerTitle}>Operaciones</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => fetchData(true)} colors={[COLORS.primary]} />
        }
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1, marginBottom: 4 }}>
          PAGOS A REPARTIDORES
        </Text>
        <Text style={styles.pageTitle}>Pago a Repartidores</Text>
        <Text style={styles.tagLine}>
          Gestión de comisiones — ${TARIFA_POR_ENTREGA.toLocaleString('es-CO')} COP por entrega completada.
        </Text>

        <TouchableOpacity
          style={[styles.btnPrimary, { marginBottom: 20 }]}
          onPress={() => {
            const resumen = filtrados.map((r) =>
              `${r.nombre}: ${r.entregas} entregas = $${r.pago.toLocaleString('es-CO')} COP`
            ).join('\n');
            Alert.alert(
              'Resumen de Pagos',
              `${resumen}\n\nTOTAL: $${totalPago.toLocaleString('es-CO')} COP`,
            );
          }}
        >
          <Text style={{ fontSize: 20 }}>💳</Text>
          <Text style={styles.btnPrimaryText}>Generar Dispersión Total</Text>
        </TouchableOpacity>

        {/* TOTAL PENDIENTE */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>TOTAL PENDIENTE DE PAGO</Text>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>${totalPago.toLocaleString('es-CO')} COP</Text>
          <Text style={styles.kpiSub}>Basado en ${TARIFA_POR_ENTREGA.toLocaleString('es-CO')} COP por entrega</Text>
        </View>

        {/* REPARTIDORES ACTIVOS */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>REPARTIDORES CON ENTREGAS</Text>
          <Text style={styles.kpiValue}>{repartidores.length}</Text>
        </View>

        {/* ENTREGAS TOTALES */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ENTREGAS COMPLETADAS</Text>
          <Text style={styles.kpiValue}>{totalEntregas}</Text>
        </View>

        {/* BUSQUEDA */}
        <View style={styles.searchWrap}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre de repartidor..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* TABLA */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Repartidor</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Entregas</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Pago</Text>
          </View>

          {filtrados.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
              No hay repartidores con entregas
            </Text>
          ) : (
            filtrados.map((rep, idx) => (
              <View key={rep.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{rep.nombre.charAt(0)}</Text>
                  </View>
                  <Text style={styles.repNombre} numberOfLines={1}>{rep.nombre}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                  {rep.entregas}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${rep.pago.toLocaleString('es-CO')}
                </Text>
              </View>
            ))
          )}

          <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: '#F8FAFC', marginTop: 4 }]}>
            <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
              {totalEntregas}
            </Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
              ${totalPago.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}