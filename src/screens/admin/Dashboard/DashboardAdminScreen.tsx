// src/screens/admin/Dashboard/DashboardAdminScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import styles from './DashboardAdminScreen.styles';

interface KpiIngresosTotal {
  valor:               number;
  variacionPorcentaje: number | null;
  fechaDesde:          string;
  fechaHasta:          string;
}

interface KpiPagoPersonal {
  valor:               number;
  entregasCompletadas: number;
  tarifaPorEntrega:    number;
}

interface KpiUtilidadBruta {
  valor:            number;
  margenPorcentaje: number;
  ingresosTotales:  number;
  pagoPersonal:     number;
}

interface Transaccion {
  numeroFactura: string;
  numGuia:       string;
  cliente:       string;
  valor:         number;
  moneda:        string;
  estadoFactura: string;
  creadoEn:      string;
}

export default function DashboardAdminScreen() {
  const { usuario } = useAuth();

  const [ingresos,      setIngresos]      = useState<KpiIngresosTotal | null>(null);
  const [pagoPersonal,  setPagoPersonal]  = useState<KpiPagoPersonal | null>(null);
  const [utilidad,      setUtilidad]      = useState<KpiUtilidadBruta | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando,      setCargando]      = useState<boolean>(false);
  const [refrescando,   setRefrescando]   = useState<boolean>(false);

  const fetchData = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [resIngresos, resPago, resUtilidad, resTrans] = await Promise.all([
        apiClient.get('/admin/finanzas/ingresos-totales'),
        apiClient.get('/admin/finanzas/pago-personal'),
        apiClient.get('/admin/finanzas/utilidad-bruta'),
        apiClient.get('/admin/finanzas/transacciones-recientes?limit=5'),
      ]);
      setIngresos(resIngresos.data);
      setPagoPersonal(resPago.data);
      setUtilidad(resUtilidad.data);
      setTransacciones(Array.isArray(resTrans.data) ? resTrans.data : []);
    } catch (e) {
      console.log('Error admin finanzas', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const formatCOP = (val: number): string =>
    `$${Math.round(val).toLocaleString('es-CO')} COP`;

  const inicial = usuario?.nombres?.charAt(0)?.toUpperCase() ?? 'A';

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finanzas</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => fetchData(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        <Text style={styles.pageTitle}>Resumen Financiero</Text>
        {ingresos && (
          <Text style={styles.pageSubtitle}>
            {new Date(ingresos.fechaDesde).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} —{' '}
            {new Date(ingresos.fechaHasta).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        )}

        {/* INGRESOS TOTALES */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 22 }}>💰</Text>
            </View>
            {ingresos?.variacionPorcentaje != null && (
              <View style={[styles.kpiBadge, {
                backgroundColor: ingresos.variacionPorcentaje >= 0 ? '#DCFCE7' : '#FEE2E2',
              }]}>
                <Text style={[styles.kpiBadgeText, {
                  color: ingresos.variacionPorcentaje >= 0 ? '#16A34A' : '#DC2626',
                }]}>
                  {ingresos.variacionPorcentaje >= 0 ? '↑' : '↓'} {Math.abs(ingresos.variacionPorcentaje).toFixed(0)}% vs periodo anterior
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.kpiLabel}>Ingresos Totales</Text>
          <Text style={styles.kpiValue}>{formatCOP(ingresos?.valor ?? 0)}</Text>
        </View>

        {/* PAGO PERSONAL */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
            {pagoPersonal?.entregasCompletadas != null && (
              <View style={[styles.kpiBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#2563EB' }]}>
                  {pagoPersonal.entregasCompletadas} entregas
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.kpiLabel}>Pago Personal</Text>
          <Text style={styles.kpiValue}>{formatCOP(pagoPersonal?.valor ?? 0)}</Text>
          {pagoPersonal?.tarifaPorEntrega != null && (
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
              ${pagoPersonal.tarifaPorEntrega.toLocaleString('es-CO')} COP por entrega
            </Text>
          )}
        </View>

        {/* UTILIDAD BRUTA */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 22 }}>📈</Text>
            </View>
            {utilidad?.margenPorcentaje != null && (
              <View style={[styles.kpiBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#D97706' }]}>
                  {utilidad.margenPorcentaje.toFixed(0)}% Margen
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.kpiLabel}>Utilidad Bruta</Text>
          <Text style={styles.kpiValue}>{formatCOP(utilidad?.valor ?? 0)}</Text>
          {utilidad && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                Ingresos: {formatCOP(utilidad.ingresosTotales)}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                Personal: {formatCOP(utilidad.pagoPersonal)}
              </Text>
            </View>
          )}
        </View>

        {/* TRANSACCIONES RECIENTES */}
        <View style={styles.transCard}>
          <View style={styles.transHeader}>
            <Text style={styles.transTitle}>Transacciones Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.transVerTodo}>Ver Todo →</Text>
            </TouchableOpacity>
          </View>

          {transacciones.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
              No hay transacciones
            </Text>
          ) : (
            transacciones.map((t, i) => (
              <View key={i} style={{
                paddingVertical:   12,
                borderBottomWidth: i < transacciones.length - 1 ? 1 : 0,
                borderBottomColor: COLORS.border,
                gap:               4,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.navy }}>
                    {t.numGuia ?? t.numeroFactura}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#16A34A' }}>
                    ${Math.round(t.valor ?? 0).toLocaleString('es-CO')} COP
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                    👤 {t.cliente}
                  </Text>
                  <View style={{
                    backgroundColor:   t.estadoFactura === 'Pagada' ? '#DCFCE7' : '#FEF3C7',
                    paddingHorizontal: 8,
                    paddingVertical:   2,
                    borderRadius:      999,
                  }}>
                    <Text style={{
                      fontSize:   10,
                      fontWeight: '700',
                      color:      t.estadoFactura === 'Pagada' ? '#16A34A' : '#D97706',
                    }}>
                      {t.estadoFactura}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                  📅 {new Date(t.creadoEn).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}