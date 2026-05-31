// src/screens/supervisor/Orders/OrdersScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@/api';
import { COLORS } from '@/theme';
import styles from './OrdersScreen.styles';
import type { OrdersStackParamList } from '@/navigation/SupervisorNavigator';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

interface Pedido {
  idPedido:           number;
  numGuia:            string;
  estadoPedido:       string;
  idEstadoPedido:     number;
  destinatarioNombre: string | null | object;
  direccion:          string;
  usuarioRepartidor:  string | null | object;
  creadoEn:           string;
  tipoOperacion:      string;
  precio:             number | null;
}

type FiltroEstado = 'Todos' | 'Asignado' | 'En curso' | 'Entregado' | 'Cancelado';

const FILTROS: FiltroEstado[] = ['Todos', 'Asignado', 'En curso', 'Entregado', 'Cancelado'];

const ESTADO_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  'creado':                     { bg: '#F3F4F6', text: '#6B7280', label: 'PENDING' },
  'asignado':                   { bg: '#FEF3C7', text: '#D97706', label: 'PENDING' },
  'recibido por el repartidor': { bg: '#DBEAFE', text: '#2563EB', label: 'IN TRANSIT' },
  'en curso':                   { bg: '#DBEAFE', text: '#2563EB', label: 'IN TRANSIT' },
  'entregado':                  { bg: '#DCFCE7', text: '#16A34A', label: 'DELIVERED' },
  'cancelado':                  { bg: '#FEE2E2', text: '#DC2626', label: 'CANCELLED' },
  'no entregado':               { bg: '#FEE2E2', text: '#DC2626', label: 'NOT DELIVERED' },
};

function getEstadoConfig(estado: string) {
  const key = estado.toLowerCase();
  for (const [k, v] of Object.entries(ESTADO_CONFIG)) {
    if (key.includes(k)) return v;
  }
  return { bg: '#F3F4F6', text: '#6B7280', label: estado.toUpperCase() };
}

function getNombre(val: string | null | object): string {
  if (typeof val === 'string') return val;
  return 'Sin asignar';
}

export default function OrdersScreen({ navigation }: Props) {
  const [pedidos,     setPedidos]     = useState<Pedido[]>([]);
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [busqueda,    setBusqueda]    = useState<string>('');
  const [filtro,      setFiltro]      = useState<FiltroEstado>('Todos');

  const fetchPedidos = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get('/supervisor/pedidos/en-reparto');
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Error pedidos supervisor', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPedidos(); }, [fetchPedidos]));

  const filtrados = pedidos.filter((p) => {
    const nombre = getNombre(p.destinatarioNombre);
    const matchBusqueda =
      p.numGuia.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchFiltro = filtro === 'Todos' ||
      p.estadoPedido?.toLowerCase().includes(filtro.toLowerCase());
    return matchBusqueda && matchFiltro;
  });

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order Management</Text>
          <Text style={styles.headerSubtitle}>
            {pedidos.length} envios activos
          </Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosContent}
      >
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA */}
      <ScrollView
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => fetchPedidos(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {cargando && (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        )}

        {!cargando && filtrados.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No hay pedidos</Text>
          </View>
        )}

        {!cargando && filtrados.map((pedido) => {
          const cfg         = getEstadoConfig(pedido.estadoPedido ?? '');
          const nombre      = getNombre(pedido.destinatarioNombre);
          const repartidor  = getNombre(pedido.usuarioRepartidor);
          const inicial     = repartidor !== 'Sin asignar'
            ? repartidor.charAt(0).toUpperCase()
            : '?';

          return (
            <View key={pedido.idPedido} style={styles.orderCard}>

              {/* TOP */}
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.guiaLabel}>GUÍA</Text>
                  <Text style={styles.guiaNum}>{pedido.numGuia}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.estadoText, { color: cfg.text }]}>{cfg.label}</Text>
                </View>
              </View>

              {/* CLIENTE */}
              <View style={styles.clienteRow}>
                <Text style={styles.clienteIcon}>👤</Text>
                <Text style={styles.clienteNombre}>{nombre}</Text>
              </View>
              <Text style={styles.direccionText}>{pedido.direccion}</Text>

              {/* REPARTIDOR + MONTO */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={styles.repartidorRow}>
                  <View style={styles.repartidorAvatar}>
                    <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 12 }}>
                      {inicial}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '700' }}>COURIER</Text>
                    <Text style={styles.repartidorNombre}>{repartidor}</Text>
                  </View>
                </View>
                {pedido.precio != null && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '700' }}>AMOUNT</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.navy }}>
                      ${pedido.precio.toLocaleString('es-CO')} COP
                    </Text>
                  </View>
                )}
              </View>

              {/* ACCIONES */}
              <View style={styles.accionesRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditOrder', {
                    idPedido: String(pedido.idPedido),
                    numGuia:  pedido.numGuia,
                  })}
                >
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>⋮</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}