// src/screens/repartidor/Pedidos/PedidosScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from './PedidosScreen.styles';
import ResumenPedidoModal from '@/components/modals/ResumenPedidoModal/ResumenPedidoModal';
import type { PedidoCliente } from '@/components/modals/ResumenPedidoModal/ResumenPedidoModal.types';
import { getApiErrorMessage } from '@/utils/helpers';
import {
  ESTADO_PEDIDO,
  filtrarPedidosPorAceptar,
  parsePedidosList,
  parsePedidosTotal,
  pedidoEstadoId,
  REPARTIDOR_PEDIDOS_PARAMS,
} from '@/utils/pedidos-api';
import { apiClient } from '@/api';
import { COLORS } from '@/theme';

interface PedidoAPI {
  idPedido:                number;
  numGuia:                 string;
  estadoPedido:            string;
  idEstadoPedido:          number;
  destinatarioNombre:      string | null | object;
  destinatarioTelefono:    string | null | object;
  direccion:               string;
  paquete:                 string;
  fragil:                  boolean;
  usuarioSolicitud:        string;
  fechaEntrega:            string;
  tipoOperacion:           string;
  observacionesManifiesto: string | null;
  fotosPaqueteUrls:        string[];
  pagadoPorRemitente:      boolean;
  precio:                  number;
}

function mapPedidoApi(raw: Record<string, unknown>): PedidoAPI {
  return {
    idPedido:                Number(raw.idPedido),
    numGuia:                 String(raw.numGuia ?? ''),
    estadoPedido:            String(raw.estadoPedido ?? ''),
    idEstadoPedido:          pedidoEstadoId(raw),
    destinatarioNombre:      raw.destinatarioNombre ?? null,
    destinatarioTelefono:    raw.destinatarioTelefono ?? null,
    direccion:               String(raw.direccion ?? ''),
    paquete:                 String(raw.paquete ?? ''),
    fragil:                  Boolean(raw.fragil),
    usuarioSolicitud:        String(raw.usuarioSolicitud ?? 'Cliente'),
    fechaEntrega:            String(raw.fechaEntrega ?? ''),
    tipoOperacion:           String(raw.tipoOperacion ?? 'DESPACHO'),
    observacionesManifiesto: typeof raw.observacionesManifiesto === 'string' ? raw.observacionesManifiesto : null,
    fotosPaqueteUrls:        Array.isArray(raw.fotosPaqueteUrls) ? raw.fotosPaqueteUrls as string[] : [],
    pagadoPorRemitente:      Boolean(raw.pagadoPorRemitente),
    precio:                  Number(raw.precio ?? 0),
  };
}

function apiToPedidoCliente(p: PedidoAPI): PedidoCliente {
  const nombre   = typeof p.destinatarioNombre   === 'string' ? p.destinatarioNombre   : 'Sin nombre';
  const telefono = typeof p.destinatarioTelefono === 'string' ? p.destinatarioTelefono : 'Sin telefono';
  return {
    id:            String(p.idPedido),
    estado:        'transito',
    cliente:       p.usuarioSolicitud ?? 'Cliente',
    destinatario:  nombre,
    telefono,
    origen:        'Bodega Principal',
    destino:       p.direccion ?? '',
    observaciones: p.observacionesManifiesto ?? (p.fragil ? 'Fragil - manejar con cuidado' : ''),
    pago:          p.tipoOperacion ?? '',
  };
}

function TipoOperacionBadge({ tipo, fragil }: { tipo: string; fragil: boolean }) {
  const esRecoleccion = tipo === 'RECOLECCION';
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
      <View style={{
        paddingHorizontal: 10,
        paddingVertical:   4,
        borderRadius:      999,
        backgroundColor:   esRecoleccion ? '#FEF3C7' : '#DBEAFE',
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: esRecoleccion ? '#D97706' : '#1D4ED8' }}>
          {esRecoleccion ? '📦 RECOGER' : '🚚 ENTREGAR'}
        </Text>
      </View>
      {fragil && (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#FEE2E2' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>⚠️ FRAGIL</Text>
        </View>
      )}
    </View>
  );
}

function EstadoPagoBadge({ pagadoPorRemitente, precio }: { pagadoPorRemitente: boolean; precio: number }) {
  const precioNum = parseFloat(String(precio)) || 0;
  return (
    <View style={{
      flexDirection:   'row',
      alignItems:      'center',
      gap:             8,
      marginTop:       8,
      padding:         10,
      borderRadius:    8,
      backgroundColor: pagadoPorRemitente ? '#DCFCE7' : '#FEF3C7',
    }}>
      <Text style={{ fontSize: 16 }}>{pagadoPorRemitente ? '✅' : '💵'}</Text>
      <View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: pagadoPorRemitente ? '#16A34A' : '#D97706' }}>
          {pagadoPorRemitente ? 'Ya está pagado' : 'Cobrar al entregar'}
        </Text>
        {!pagadoPorRemitente && precioNum > 0 && (
          <Text style={{ fontSize: 11, color: '#D97706' }}>
            Valor a cobrar: ${precioNum.toLocaleString('es-CO')} COP
          </Text>
        )}
      </View>
    </View>
  );
}

export default function PedidosScreen() {
  const [pedidos,            setPedidos]            = useState<PedidoAPI[]>([]);
  const [cargando,           setCargando]           = useState<boolean>(false);
  const [refrescando,        setRefrescando]        = useState<boolean>(false);
  const [modalVisible,       setModalVisible]       = useState<boolean>(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoCliente | null>(null);
  const [busqueda,           setBusqueda]           = useState<string>('');
  const [aceptando,          setAceptando]          = useState<number | null>(null);
  const [error,              setError]              = useState<string>('');
  const [totalServidor,      setTotalServidor]      = useState<number>(0);

  const cargarPedidos = async (esRefresco = false): Promise<void> => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError('');
    try {
      const { data } = await apiClient.get('/repartidor/pedidos', {
        params: REPARTIDOR_PEDIDOS_PARAMS,
      });
      const lista = parsePedidosList(data);
      setTotalServidor(parsePedidosTotal(data));
      setPedidos(filtrarPedidosPorAceptar(lista).map(mapPedidoApi));
    } catch (e) {
      const msg = getApiErrorMessage(
        e,
        'No se pudieron cargar los pedidos. Verifica tu conexión e intenta de nuevo.',
      );
      setError(msg);
      setPedidos([]);
      console.log('ERROR cargando pedidos repartidor:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarPedidos(); }, []));

  const aceptarPedido = async (item: PedidoAPI): Promise<void> => {
    Alert.alert(
      'Aceptar Pedido',
      `¿Confirmas que recibes el pedido ${item.numGuia}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            setAceptando(item.idPedido);
            try {
              if (item.idEstadoPedido === 2) {
                await apiClient.post(`/repartidor/pedidos/${item.idPedido}/recibir`);
              }
              await apiClient.post(`/repartidor/pedidos/${item.idPedido}/aceptar`);
              setPedidos((prev) => prev.filter((p) => p.idPedido !== item.idPedido));
            } catch (error: unknown) {
              const err = error as { response?: { status?: number; data?: { message?: unknown } }; message?: string };
              if (err?.response?.status === 409) {
                setPedidos((prev) => prev.filter((p) => p.idPedido !== item.idPedido));
              } else {
                const msg = err?.response?.data?.message ?? err?.message ?? 'Error al aceptar pedido';
                Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
              }
            } finally {
              setAceptando(null);
            }
          },
        },
      ],
    );
  };

  const abrirPedido = (pedido: PedidoAPI): void => {
    setPedidoSeleccionado(apiToPedidoCliente(pedido));
    setModalVisible(true);
  };

  const filtrados = pedidos.filter(
    (p) =>
      (typeof p.destinatarioNombre === 'string' ? p.destinatarioNombre : '')
        .toLowerCase().includes(busqueda.toLowerCase()) ||
      p.numGuia.toLowerCase().includes(busqueda.toLowerCase()),
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargarPedidos(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxSpacing]}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statNum}>{pedidos.filter(p => p.tipoOperacion === 'RECOLECCION').length}</Text>
            <Text style={styles.statLabel}>Recoger</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🚚</Text>
            <Text style={styles.statNum}>{pedidos.filter(p => p.tipoOperacion !== 'RECOLECCION').length}</Text>
            <Text style={styles.statLabel}>Entregar</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Buscar pedidos..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos por Aceptar</Text>
          <Text style={styles.sectionCount}>{filtrados.length} pedidos</Text>
        </View>

        {!!error && (
          <View style={{
            backgroundColor: '#FEE2E2',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}>
            <Text style={{ color: COLORS.error, fontWeight: '700', marginBottom: 4 }}>
              No se pudieron cargar los pedidos
            </Text>
            <Text style={{ color: '#991B1B', fontSize: 13 }}>{error}</Text>
            <TouchableOpacity onPress={() => cargarPedidos(true)} style={{ marginTop: 10 }}>
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PEDIDOS */}
        {!error && filtrados.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
              No tienes pedidos por aceptar
            </Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 24 }}>
              {totalServidor > 0
                ? `El servidor devolvió ${totalServidor} pedido(s), pero ninguno está en estado Asignado, Recibido o En curso. Revisa la pestaña Mi Ruta o Historial.`
                : 'Aparecen aquí cuando te asignen pedidos en estado Asignado, Recibido o En curso.'}
            </Text>
          </View>
        ) : (
          filtrados.map((item) => (
            <View key={item.idPedido} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{item.numGuia}</Text>
                <View style={[styles.statusBadge, styles.statusBlue]}>
                  <Text style={styles.statusText}>{item.estadoPedido?.toUpperCase()}</Text>
                </View>
              </View>

              <TipoOperacionBadge tipo={item.tipoOperacion} fragil={item.fragil} />

              <EstadoPagoBadge
                pagadoPorRemitente={item.pagadoPorRemitente}
                precio={item.precio}
              />

              <Text style={[styles.clientName, { marginTop: 8 }]}>
                {typeof item.destinatarioNombre === 'string' ? item.destinatarioNombre : 'Sin destinatario'}
              </Text>
              <View style={styles.locRow}>
                <Text>📍 </Text>
                <Text style={styles.locText}>{item.direccion}</Text>
              </View>

              {/* BOTONES */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1 }]}
                  onPress={() => abrirPedido(item)}
                >
                  <Text style={styles.actionBtnText}>Ver Resumen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex:            1,
                    backgroundColor: (
                      item.idEstadoPedido === ESTADO_PEDIDO.EN_CURSO
                      || item.idEstadoPedido === ESTADO_PEDIDO.CREADO
                    )
                      ? '#94A3B8'
                      : aceptando === item.idPedido
                        ? '#94A3B8'
                        : '#10B981',
                    borderRadius:    8,
                    padding:         10,
                    alignItems:      'center',
                    justifyContent:  'center',
                  }}
                  onPress={() => aceptarPedido(item)}
                  disabled={
                    aceptando === item.idPedido
                    || item.idEstadoPedido === ESTADO_PEDIDO.EN_CURSO
                    || item.idEstadoPedido === ESTADO_PEDIDO.CREADO
                  }
                >
                  {aceptando === item.idPedido
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                        {item.idEstadoPedido === ESTADO_PEDIDO.EN_CURSO
                          ? 'En Mi Ruta'
                          : item.idEstadoPedido === ESTADO_PEDIDO.CREADO
                            ? 'Pendiente'
                            : item.idEstadoPedido === ESTADO_PEDIDO.ASIGNADO
                              ? 'Recibir'
                              : 'Aceptar'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ResumenPedidoModal
        visible={modalVisible}
        pedido={pedidoSeleccionado}
        onClose={() => setModalVisible(false)}
        onIniciarViaje={() => setModalVisible(false)}
      />
    </View>
  );
}