// src/screens/repartidor/Historial/HistorialRepartidorScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from './HistorialRepartidorScreen.styles';
import { apiClient } from '@/api';
import { COLORS } from '@/theme';

interface PedidoHistorial {
  idPedido:           number;
  idEstadoPedido:     number;
  numGuia:            string;
  estadoPedido:       string;
  destinatarioNombre: string | null | object;
  direccion:          string;
  fechaEntrega:       string;
  creadoEn:           string;
  tipoOperacion:      string;
}

type FiltroTiempo = 'hoy' | 'semana' | 'todos';

export default function HistorialRepartidorScreen() {
  const [pedidos,      setPedidos]      = useState<PedidoHistorial[]>([]);
  const [cargando,     setCargando]     = useState<boolean>(false);
  const [refrescando,  setRefrescando]  = useState<boolean>(false);
  const [filtroTiempo, setFiltroTiempo] = useState<FiltroTiempo>('hoy');

  const cargarHistorial = async (esRefresco = false): Promise<void> => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get('/repartidor/pedidos');
      const lista = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];      setPedidos(lista.filter((p: Record<string, unknown>) =>
        p.idEstadoPedido === 5 || p.idEstadoPedido === 7
      ));
    } catch (e) {
      console.log('ERROR cargando historial:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarHistorial(); }, []));

  const filtrarPorTiempo = (lista: PedidoHistorial[]): PedidoHistorial[] => {
    const hoy    = new Date();
    hoy.setHours(0, 0, 0, 0);
    const semana = new Date(hoy);
    semana.setDate(semana.getDate() - 7);

    return lista.filter((p) => {
      const fecha = new Date(p.creadoEn ?? p.fechaEntrega);
      if (filtroTiempo === 'hoy')    return fecha >= hoy;
      if (filtroTiempo === 'semana') return fecha >= semana;
      return true;
    });
  };

  const pedidosFiltrados = filtrarPorTiempo(pedidos);
  const entregados       = pedidosFiltrados.filter((p) => p.idEstadoPedido === 5).length;
  const noEntregados     = pedidosFiltrados.filter((p) => p.idEstadoPedido === 7).length;

  const renderItem: ListRenderItem<PedidoHistorial> = ({ item }) => {
    const esEntregado = item.idEstadoPedido === 5;
    return (
      <View style={styles.entregaCard}>
        <View style={styles.cardInfo}>
          <Text style={styles.horaText}>{item.numGuia}</Text>
          <Text style={styles.clienteText}>
            {typeof item.destinatarioNombre === 'string' ? item.destinatarioNombre : 'Sin destinatario'}
          </Text>
          <Text style={styles.metodoTag}>{item.direccion}</Text>
          <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
            {item.tipoOperacion === 'RECOLECCION' ? '📦 Recoger' : '🚚 Entregar'}
          </Text>
        </View>
        <View style={styles.cardMonto}>
          <Text style={{ fontSize: 16 }}>{esEntregado ? '✅' : '❌'}</Text>
          <Text style={[styles.montoText, {
            fontSize: 12,
            color:    esEntregado ? '#10B981' : '#EF4444',
          }]}>
            {esEntregado ? 'Entregado' : 'No entregado'}
          </Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Historial de Entregas</Text>
        <Text style={{ color: '#64748B', fontSize: 13 }}>
          {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* FILTROS TIEMPO */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
        {([
          { key: 'hoy',    label: 'Hoy' },
          { key: 'semana', label: 'Semana' },
          { key: 'todos',  label: 'Histórico' },
        ] as { key: FiltroTiempo; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFiltroTiempo(f.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical:   8,
              borderRadius:      999,
              backgroundColor:   filtroTiempo === f.key ? '#0F2B46' : '#F1F5F9',
            }}
          >
            <Text style={{
              fontSize:   13,
              fontWeight: '600',
              color:      filtroTiempo === f.key ? '#fff' : '#64748B',
            }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* STATS */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={[styles.statBox, { flex: 1, backgroundColor: '#1E293B' }]}>
          <Text style={styles.statLabel}>Entregados</Text>
          <Text style={styles.statValue}>{entregados}</Text>
        </View>
        <View style={[styles.statBox, { flex: 1, backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statLabel, { color: '#DC2626' }]}>No entregados</Text>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>{noEntregados}</Text>
        </View>
      </View>

      {pedidosFiltrados.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={{ color: '#64748B', fontSize: 15 }}>No hay pedidos en este periodo</Text>
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
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