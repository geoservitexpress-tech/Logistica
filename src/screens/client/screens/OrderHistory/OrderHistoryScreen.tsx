// src/screens/client/screens/OrderHistory/OrderHistoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import styles from './OrderHistoryScreen.styles';
import OrderDetailModal from './OrderDetailModal';
import type { Order, OrderEstado } from './OrderDetailModal';
import type { ClientTabParamList } from '@/navigation/navigation.types';
import { apiClient, ENDPOINTS } from '@/api';

type Props = BottomTabScreenProps<ClientTabParamList, 'Historial'>;

type FiltroFecha = 'todos' | 'hoy' | 'semana' | 'mes' | 'custom';

interface StatusConfig {
  label: string;
  bg:    string;
  text:  string;
  icon:  string;
}

interface StatusBadgeProps {
  estado: OrderEstado;
}

const STATUS_CONFIG: Record<OrderEstado, StatusConfig> = {
  espera: {
    label: 'En espera',
    bg:    '#F3F4F6',
    text:  '#6B7280',
    icon:  '📋',
  },
  recogida: {
    label: 'Recogida pendiente',
    bg:    '#EDE9FE',
    text:  '#7C3AED',
    icon:  '📦',
  },
  transito: {
    label: 'En Tránsito',
    bg:    '#DBEAFE',
    text:  '#2563EB',
    icon:  '🚚',
  },
  entregado: {
    label: 'Entregado',
    bg:    '#DCFCE7',
    text:  COLORS.success,
    icon:  '✅',
  },
  noEntregado: {
    label: 'No entregado',
    bg:    '#FEE2E2',
    text:  '#DC2626',
    icon:  '❌',
  },
  pendiente: {
    label: 'Pendiente',
    bg:    '#FEF3C7',
    text:  '#D97706',
    icon:  '⏳',
  },
};

function mapEstadoPorId(idEstado: number, tipoOperacion: string): OrderEstado {
  switch (idEstado) {
    case 5: return 'entregado';
    case 7: return 'noEntregado';
    case 6: return 'pendiente';
    case 3:
    case 4: return 'transito';
    case 2: return 'transito';
    case 1:
    default:
      return tipoOperacion === 'RECOLECCION' ? 'recogida' : 'espera';
  }
}

// Guarda la fecha cruda (ISO) para poder filtrar
function mapBackendToOrder(item: Record<string, unknown>): Order & { _fechaRaw?: string } {
  const idEstado     = (item.idEstadoPedido as number) ?? 0;
  const tipoOperacion = (item.tipoOperacion as string) ?? '';
  return {
    id:            (item.numGuia as string) ?? (item.idPedido as string) ?? '',
    estado:        mapEstadoPorId(idEstado, tipoOperacion),
    fecha:         item.creadoEn
                     ? new Date(item.creadoEn as string).toLocaleDateString('es-CO')
                     : '',
    _fechaRaw:     (item.creadoEn as string) ?? '',
    destinatario:  (item.destinatarioNombre as string) ?? '',
    telefono:      (item.destinatarioTelefono as string) ?? '',
    origen:        'Bogota, CO',
    destino:       (item.direccion as string) ?? '',
    companyName:   (item.usuarioSolicitud as string) ?? '',
    mensajero:     (item.usuarioRepartidor as string) ?? undefined,
    mensajeroTelefono: (item.usuarioRepartidorTelefono as string) ?? undefined,
    pago:          (item.metodoRecepcion as string) ?? '',
    metodoEntrega: tipoOperacion,
    fragil:        (item.fragil as boolean) ?? false,
    manifestObs:   (item.observacionesManifiesto as string) ?? undefined,
    fotos:         (item.fotosPaqueteUrls as string[]) ?? [],
    observacionesEntrega: (item.observacionesEntrega as string) ?? undefined,
  };
}

const StatusBadge = ({ estado }: StatusBadgeProps) => {
  const cfg = STATUS_CONFIG[estado] ?? STATUS_CONFIG.pendiente;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

// Valida formato YYYY-MM-DD
function parseFecha(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto.trim())) return null;
  const d = new Date(`${texto.trim()}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export default function OrderHistoryScreen({ navigation }: Props) {
  const { usuario } = useAuth();

  const [pedidos,       setPedidos]       = useState<(Order & { _fechaRaw?: string })[]>([]);
  const [cargando,      setCargando]      = useState<boolean>(false);
  const [refrescando,   setRefrescando]   = useState<boolean>(false);
  const [error,         setError]         = useState<string | null>(null);
  const [busqueda,      setBusqueda]      = useState<string>('');
  const [pedidoSelecto, setPedidoSelecto] = useState<Order | null>(null);

  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('todos');
  const [fechaDesde,  setFechaDesde]  = useState<string>('');
  const [fechaHasta,  setFechaHasta]  = useState<string>('');

  const fetchPedidos = useCallback(async (esRefresh = false): Promise<void> => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setError(null);

    try {
      const idUsuario = usuario?.idUsuario;
      const base = idUsuario
        ? `${ENDPOINTS.PEDIDOS.GET_ALL}?idUsuario=${idUsuario}&limit=50&page=1`
        : `${ENDPOINTS.PEDIDOS.GET_ALL}?limit=50&page=1`;

      const { data } = await apiClient.get(base);
      const lista = Array.isArray(data)
        ? data.map((item: Record<string, unknown>) => mapBackendToOrder(item))
        : Array.isArray(data?.items)
          ? data.items.map((item: Record<string, unknown>) => mapBackendToOrder(item))
          : [];
      setPedidos(lista);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? 'Error al cargar pedidos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario?.idUsuario]);

  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos]),
  );

  // Filtro por fecha
  const filtrarPorFecha = (lista: (Order & { _fechaRaw?: string })[]) => {
    if (filtroFecha === 'todos') return lista;

    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    return lista.filter((p) => {
      if (!p._fechaRaw) return false;
      const f = new Date(p._fechaRaw);
      if (isNaN(f.getTime())) return false;

      if (filtroFecha === 'hoy') {
        return f >= inicioHoy;
      }
      if (filtroFecha === 'semana') {
        const hace7 = new Date(inicioHoy);
        hace7.setDate(hace7.getDate() - 7);
        return f >= hace7;
      }
      if (filtroFecha === 'mes') {
        const hace30 = new Date(inicioHoy);
        hace30.setDate(hace30.getDate() - 30);
        return f >= hace30;
      }
      if (filtroFecha === 'custom') {
        const desde = parseFecha(fechaDesde);
        const hasta = parseFecha(fechaHasta);
        if (desde && f < desde) return false;
        if (hasta) {
          const finDia = new Date(hasta);
          finDia.setHours(23, 59, 59, 999);
          if (f > finDia) return false;
        }
        return true;
      }
      return true;
    });
  };

  const filtrados = filtrarPorFecha(pedidos).filter(
    (p) =>
      p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.destino ?? '').toLowerCase().includes(busqueda.toLowerCase()),
  );

  const inicial = usuario?.nombres?.charAt(0)?.toUpperCase() ?? 'U';

  const FILTROS: { key: FiltroFecha; label: string }[] = [
    { key: 'todos',  label: 'Todos' },
    { key: 'hoy',    label: 'Hoy' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes',    label: 'Mes' },
    { key: 'custom', label: 'Fecha' },
  ];

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>
          Hola, {usuario?.nombres || 'Usuario'}
        </Text>
        <View style={styles.avatar}>
          <Text>{inicial}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => fetchPedidos(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Enviados</Text>
            <Text style={styles.statIcon}>📋</Text>
          </View>
          <Text style={styles.statValue}>{pedidos.length}</Text>
          <Text style={[styles.statSub, { color: COLORS.primary }]}>
            {filtrados.length} mostrados
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Historial de Pedidos</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por guia o ciudad..."
              placeholderTextColor={COLORS.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </View>

        {/* FILTROS POR FECHA */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {FILTROS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFiltroFecha(f.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical:   8,
                borderRadius:      999,
                backgroundColor:   filtroFecha === f.key ? COLORS.primary : '#F1F5F9',
              }}
            >
              <Text style={{
                color:      filtroFecha === f.key ? '#fff' : '#64748B',
                fontWeight: '600',
                fontSize:   13,
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RANGO PERSONALIZADO */}
        {filtroFecha === 'custom' && (
          <View style={{
            backgroundColor:   '#F8FAFC',
            borderRadius:      12,
            padding:           12,
            marginBottom:      12,
            borderWidth:       1,
            borderColor:       COLORS.border,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 }}>
              Rango de fechas (YYYY-MM-DD)
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Desde</Text>
                <TextInput
                  style={{
                    backgroundColor: '#fff',
                    borderRadius:    8,
                    borderWidth:     1,
                    borderColor:     COLORS.border,
                    paddingHorizontal: 10,
                    paddingVertical:   8,
                    fontSize:        13,
                    color:           COLORS.textPrimary,
                  }}
                  placeholder="2026-06-01"
                  placeholderTextColor={COLORS.textMuted}
                  value={fechaDesde}
                  onChangeText={setFechaDesde}
                  autoCapitalize="none"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Hasta</Text>
                <TextInput
                  style={{
                    backgroundColor: '#fff',
                    borderRadius:    8,
                    borderWidth:     1,
                    borderColor:     COLORS.border,
                    paddingHorizontal: 10,
                    paddingVertical:   8,
                    fontSize:        13,
                    color:           COLORS.textPrimary,
                  }}
                  placeholder="2026-06-30"
                  placeholderTextColor={COLORS.textMuted}
                  value={fechaHasta}
                  onChangeText={setFechaHasta}
                  autoCapitalize="none"
                />
              </View>
            </View>
            {(fechaDesde !== '' && parseFecha(fechaDesde) === null) ||
             (fechaHasta !== '' && parseFecha(fechaHasta) === null) ? (
              <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>
                Formato inválido. Usa YYYY-MM-DD (ej: 2026-06-15)
              </Text>
            ) : null}
          </View>
        )}

        {cargando && (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {!cargando && error && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={[styles.emptyText, { color: COLORS.error }]}>{error}</Text>
            <TouchableOpacity onPress={() => fetchPedidos()} style={{ marginTop: 12 }}>
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No hay pedidos en este filtro</Text>
          </View>
        )}

        {!cargando && !error && filtrados.map((pedido) => (
          <TouchableOpacity
            key={pedido.id}
            style={styles.orderCard}
            activeOpacity={0.85}
            onPress={() => setPedidoSelecto(pedido)}
          >
            <View style={styles.orderTop}>
              <View style={styles.orderIconWrap}>
                <Text style={styles.orderIconText}>
                  {STATUS_CONFIG[pedido.estado]?.icon ?? '📦'}
                </Text>
              </View>
              <View style={styles.orderMeta}>
                <Text style={styles.orderId}>{pedido.id}</Text>
                <Text style={styles.orderDate}>{pedido.fecha}</Text>
              </View>
            </View>
            <View style={styles.orderBottom}>
              <StatusBadge estado={pedido.estado} />
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.iconBtn}>
                <Text>👁</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.orderRoute}>
              {pedido.origen} → {pedido.destino}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PedidosTab')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <OrderDetailModal
        visible={!!pedidoSelecto}
        order={pedidoSelecto}
        onClose={() => setPedidoSelecto(null)}
      />
    </View>
  );
}