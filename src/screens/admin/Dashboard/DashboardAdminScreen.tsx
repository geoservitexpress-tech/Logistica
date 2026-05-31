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
  total:               number;
  variacionPorcentaje: number | null;
}

interface KpiPagoPersonal {
  total: number;
}

interface KpiUtilidadBruta {
  utilidad:        number;
  margenPorcentaje: number;
}

interface Transaccion {
  numeroFactura: string;
  numGuia:       string;
  cliente:       string;
  valor:         number;
}

export default function DashboardAdminScreen() {
  const { usuario } = useAuth();

  const [ingresos,       setIngresos]       = useState<KpiIngresosTotal | null>(null);
  const [pagoPersonal,   setPagoPersonal]   = useState<KpiPagoPersonal | null>(null);
  const [utilidad,       setUtilidad]       = useState<KpiUtilidadBruta | null>(null);
  const [transacciones,  setTransacciones]  = useState<Transaccion[]>([]);
  const [cargando,       setCargando]       = useState<boolean>(false);
  const [refrescando,    setRefrescando]    = useState<boolean>(false);

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
    `$${val.toLocaleString('es-CO')} COP`;

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
        <Text style={styles.pageSubtitle}>
          Control de ingresos y rentabilidad operativa en tiempo real.
        </Text>

        {/* INGRESOS TOTALES */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 22 }}>💰</Text>
            </View>
            {ingresos?.variacionPorcentaje != null && (
              <View style={[styles.kpiBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#16A34A' }]}>
                  ↑ +{ingresos.variacionPorcentaje.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.kpiLabel}>Ingresos Totales</Text>
          <Text style={styles.kpiValue}>{formatCOP(ingresos?.total ?? 0)}</Text>
        </View>

        {/* PAGO PERSONAL */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconBox}>
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
          </View>
          <Text style={styles.kpiLabel}>Pago Personal</Text>
          <Text style={styles.kpiValue}>{formatCOP(pagoPersonal?.total ?? 0)}</Text>
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
          <Text style={styles.kpiValue}>{formatCOP(utilidad?.utilidad ?? 0)}</Text>
        </View>

        {/* TRANSACCIONES RECIENTES */}
        <View style={styles.transCard}>
          <View style={styles.transHeader}>
            <Text style={styles.transTitle}>Transacciones Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.transVerTodo}>Ver Todo →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Orden ID</Text>
            <Text style={styles.tableHeaderText}>Cliente</Text>
            <Text style={styles.tableHeaderText}>Valor</Text>
          </View>

          {transacciones.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
              No hay transacciones
            </Text>
          ) : (
            transacciones.map((t, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCellBold}>{t.numGuia ?? t.numeroFactura}</Text>
                <Text style={styles.tableCell}>{t.cliente}</Text>
                <Text style={styles.tableCell}>${(t.valor ?? 0).toLocaleString('es-CO')}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}