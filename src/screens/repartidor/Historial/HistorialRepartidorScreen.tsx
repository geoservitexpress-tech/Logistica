// src/screens/repartidor/Historial/HistorialRepartidorScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from './HistorialRepartidorScreen.styles';
import { apiClient } from '@/api';
import { COLORS } from '@/theme';

interface PedidoHistorial {
  idPedido:             number;
  numGuia:              string;
  estadoPedido:         string;
  destinatarioNombre:   string | null | object;
  direccion:            string;
  fechaEntrega:         string;
  tipoOperacion:        string;
}

export default function HistorialRepartidorScreen() {
  const [pedidos,     setPedidos]     = useState<PedidoHistorial[]>([]);
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarHistorial = async (esRefresco = false): Promise<void> => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get('/repartidor/pedidos');
      const lista = Array.isArray(data) ? data : [];
      // Solo pedidos Entregados (5)
      setPedidos(lista.filter((p: PedidoHistorial) => (p as unknown as Record<string, unknown>).idEstadoPedido === 5));
    } catch (e) {
      console.log('ERROR cargando historial:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, []),
  );

  const renderItem: ListRenderItem<PedidoHistorial> = ({ item }) => (
    <View style={styles.entregaCard}>
      <View style={styles.cardInfo}>
        <Text style={styles.horaText}>{item.numGuia}</Text>
        <Text style={styles.clienteText}>
          {typeof item.destinatarioNombre === 'string' ? item.destinatarioNombre : 'Sin destinatario'}
        </Text>
        <Text style={styles.metodoTag}>{item.direccion}</Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{item.tipoOperacion}</Text>
      </View>
      <View style={styles.cardMonto}>
        <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 16 }}>✓</Text>
        <Text style={[styles.montoText, { fontSize: 12, color: '#10B981' }]}>Entregado</Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Historial de Entregas</Text>
        <Text style={{ color: '#64748B', fontSize: 13 }}>
          {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: '#1E293B' }]}>
          <Text style={styles.statLabel}>Entregados hoy</Text>
          <Text style={styles.statValue}>{pedidos.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Entregas Completadas</Text>

      {pedidos.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>{'[P]'}</Text>
          <Text style={{ color: '#64748B', fontSize: 15 }}>No hay entregas completadas aun</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.idPedido)}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => cargarHistorial(true)}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
}