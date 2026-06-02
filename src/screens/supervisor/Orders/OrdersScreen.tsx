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
import { apiClient, ENDPOINTS } from '@/api';
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

type Vista        = 'enReparto' | 'historial';
type FiltroEstado = 'Todos' | 'Asignado' | 'En curso' | 'Entregado' | 'No entregado';

const FILTROS: FiltroEstado[] = ['Todos', 'Asignado', 'En curso', 'Entregado', 'No entregado'];

const FILTRO_IDS: Record<FiltroEstado, number[]> = {
  'Todos':        [],
  'Asignado':     [2, 3],
  'En curso':     [4],
  'Entregado':    [5],
  'No entregado': [7],
};

const ESTADO_ID_CONFIG: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#F3F4F6', text: '#6B7280', label: 'CREADO' },
  2: { bg: '#FEF3C7', text: '#D97706', label: 'ASIGNADO' },
  3: { bg: '#DBEAFE', text: '#2563EB', label: 'EN TRÁNSITO' },
  4: { bg: '#DBEAFE', text: '#2563EB', label: 'EN CURSO' },
  5: { bg: '#DCFCE7', text: '#16A34A', label: 'ENTREGADO' },
  6: { bg: '#FEE2E2', text: '#DC2626', label: 'CANCELADO' },
  7: { bg: '#FEE2E2', text: '#DC2626', label: 'NO ENTREGADO' },
};

function getNombre(val: string | null | object): string {
  if (typeof val === 'string') return val;
  return 'Sin asignar';
}

export default function OrdersScreen({ navigation }: Props) {
  const [pedidosReparto,   setPedidosReparto]   = useState<Pedido[]>([]);
  const [pedidosHistorial, setPedidosHistorial] = useState<Pedido[]>([]);
  const [cargando,         setCargando]         = useState<boolean>(false);
  const [refrescando,      setRefrescando]      = useState<boolean>(false);
  const [busqueda,         setBusqueda]         = useState<string>('');
  const [filtro,           setFiltro]           = useState<FiltroEstado>('Todos');
  const [vista,            setVista]            = useState<Vista>('enReparto');

  const fetchPedidos = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [resReparto, resHistorial] = await Promise.all([
        apiClient.get('/supervisor/pedidos/en-reparto'),
        apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL),
      ]);
      setPedidosReparto(Array.isArray(resReparto.data) ? resReparto.data : []);
      setPedidosHistorial(Array.isArray(resHistorial.data) ? resHistorial.data : []);
    } catch (e) {
      console.log('Error pedidos supervisor', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPedidos(); }, [fetchPedidos]));

  const pedidosActivos = vista === 'enReparto' ? pedidosReparto : pedidosHistorial;

  const filtrados = pedidosActivos.filter((p) => {
    const nombre = getNombre(p.destinatarioNombre);
    const matchBusqueda =
      p.numGuia.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombre.toLowerCase().includes(busqueda.toLowerCase());
    const ids = FILTRO_IDS[filtro];
    const matchFiltro = filtro === 'Todos' || ids.includes(p.idEstadoPedido);
    return matchBusqueda && matchFiltro;
  });

  const renderCard = (pedido: Pedido) => {
    const cfg        = ESTADO_ID_CONFIG[pedido.idEstadoPedido] ?? { bg: '#F3F4F6', text: '#6B7280', label: 'DESCONOCIDO' };
    const nombre     = getNombre(pedido.destinatarioNombre);
    const repartidor = getNombre(pedido.usuarioRepartidor);
    const inicial    = repartidor !== 'Sin asignar' ? repartidor.charAt(0).toUpperCase() : '?';

    return (
      <View key={pedido.idPedido} style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.guiaLabel}>GUÍA</Text>
            <Text style={styles.guiaNum}>{pedido.numGuia}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.estadoText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.clienteRow}>
          <Text style={styles.clienteIcon}>👤</Text>
          <Text style={styles.clienteNombre}>{nombre}</Text>
        </View>
        <Text style={styles.direccionText}>{pedido.direccion}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={styles.repartidorRow}>
            <View style={styles.repartidorAvatar}>
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 12 }}>{inicial}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '700' }}>REPARTIDOR</Text>
              <Text style={styles.repartidorNombre}>{repartidor}</Text>
            </View>
          </View>
          {pedido.precio != null && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '700' }}>MONTO</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.navy }}>
                ${Math.round(parseFloat(String(pedido.precio))).toLocaleString('es-CO')} COP
              </Text>
            </View>
          )}
        </View>

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
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión de Pedidos</Text>
          <Text style={styles.headerSubtitle}>
            {vista === 'enReparto'
              ? `${pedidosReparto.length} envíos activos`
              : `${pedidosHistorial.length} pedidos en total`}
          </Text>
        </View>
      </View>

      {/* TABS */}
      <View style={{
        flexDirection:     'row',
        backgroundColor:   COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        {(['enReparto', 'historial'] as Vista[]).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => { setVista(v); setFiltro('Todos'); }}
            style={{
              flex:              1,
              paddingVertical:   14,
              alignItems:        'center',
              borderBottomWidth: vista === v ? 2 : 0,
              borderBottomColor: COLORS.primary,
            }}
          >
            <Text style={{
              fontSize:   13,
              fontWeight: '700',
              color:      vista === v ? COLORS.primary : COLORS.textMuted,
            }}>
              {v === 'enReparto' ? '🚚 En Reparto' : '📋 Historial'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pedidos..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
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

        {!cargando && filtrados.map((pedido) => renderCard(pedido))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}