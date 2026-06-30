// src/screens/supervisor/Orders/EditOrder/EditOrderScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal as RNModal,
  FlatList,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './EditOrderScreen.styles';
import type { OrdersStackParamList } from '@/navigation/SupervisorNavigator';

type Props = NativeStackScreenProps<OrdersStackParamList, 'EditOrder'>;

interface PedidoDetalle {
  idPedido:             number;
  numGuia:              string;
  estadoPedido:         string;
  idEstadoPedido:       number;
  destinatarioNombre:   string | null | object;
  destinatarioTelefono: string | null | object;
  direccion:            string;
  usuarioRepartidor:    string | null | object;
  fragil:               boolean;
  precio:               number | null;
  fechaEntrega:         string | null;
}

interface Repartidor {
  nombre: string;
}

const ESTADOS = [
  { id: 1, nombre: 'Creado' },
  { id: 2, nombre: 'Asignado' },
  { id: 3, nombre: 'Recibido' },
  { id: 4, nombre: 'En curso' },
  { id: 5, nombre: 'Entregado' },
  { id: 7, nombre: 'No entregado' },
  { id: 8, nombre: 'Devuelto' },
];

const COLORES_AVATAR = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

export default function EditOrderScreen({ navigation, route }: Props) {
  const { idPedido, numGuia } = route.params;

  const [pedido,       setPedido]       = useState<PedidoDetalle | null>(null);
  const [estadoElegido, setEstadoElegido] = useState<number>(1);
  const [destinatario, setDestinatario] = useState<string>('');
  const [telefono,     setTelefono]     = useState<string>('');
  const [precio,       setPrecio]       = useState<string>('');
  const [fragil,       setFragil]       = useState<boolean>(false);
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [repElegido,   setRepElegido]   = useState<Repartidor | null>(null);
  const [showRepModal, setShowRepModal] = useState<boolean>(false);
  const [cargando,     setCargando]     = useState<boolean>(true);
  const [guardando,    setGuardando]    = useState<boolean>(false);

  useEffect(() => { cargarDatos(); }, []);

  const getNombre = (val: string | null | object): string => {
    if (typeof val === 'string') return val;
    return '';
  };

  const cargarDatos = async (): Promise<void> => {
    try {
      const [resPedido, resTodos] = await Promise.all([
        apiClient.get(ENDPOINTS.PEDIDOS.GET_BY_ID(idPedido)),
        apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL),
      ]);

      const p = resPedido.data as PedidoDetalle;
      setPedido(p);
      setEstadoElegido(p.idEstadoPedido ?? 1);
      setDestinatario(getNombre(p.destinatarioNombre));
      setTelefono(getNombre(p.destinatarioTelefono));
      setPrecio(p.precio != null ? String(Math.round(parseFloat(String(p.precio)))) : '');
      setFragil(p.fragil ?? false);
      setFechaEntrega(p.fechaEntrega ?? '');

      const pedidos = Array.isArray(resTodos.data) ? resTodos.data : [];
      const nombres = new Set<string>();
      pedidos.forEach((ped: Record<string, unknown>) => {
        const nombre = typeof ped.usuarioRepartidor === 'string' ? ped.usuarioRepartidor : null;
        if (nombre) nombres.add(nombre);
      });
      setRepartidores(Array.from(nombres).map((n) => ({ nombre: n })));

    } catch (e) {
      console.log('Error cargando pedido', e);
      Alert.alert('Error', 'No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (): Promise<void> => {
  if (!pedido) return;
  setGuardando(true);
  try {
    const body: Record<string, unknown> = {};

    // Solo mandar campos que cambiaron
    if (estadoElegido !== pedido.idEstadoPedido) {
      body.idEstadoPedido = estadoElegido;
    }

    const destOriginal = typeof pedido.destinatarioNombre === 'string' ? pedido.destinatarioNombre : '';
    if (destinatario && destinatario !== destOriginal) {
      body.nombreDestinatario = destinatario;
    }

    const telOriginal = typeof pedido.destinatarioTelefono === 'string' ? pedido.destinatarioTelefono : '';
    if (telefono && telefono !== telOriginal) {
      body.telefonoDestinatario = telefono;
    }

    if (fragil !== pedido.fragil) {
      body.fragil = fragil;
    }

    const precioOriginal = pedido.precio != null
      ? Math.round(parseFloat(String(pedido.precio)))
      : 0;
    const precioNuevo = precio ? parseFloat(precio) : 0;
    if (precioNuevo > 0 && precioNuevo !== precioOriginal) {
      body.precio = precioNuevo;
    }

    if (fechaEntrega && fechaEntrega !== pedido.fechaEntrega) {
      body.fechaEntrega = fechaEntrega;
    }

    // Si no hay cambios
    if (Object.keys(body).length === 0) {
      Alert.alert('Sin cambios', 'No has modificado ningún campo.');
      setGuardando(false);
      return;
    }

    console.log('PATCH url:', `/supervisor/pedidos/${idPedido}`);
    console.log('PATCH body:', JSON.stringify(body, null, 2));

    await apiClient.patch(`/supervisor/pedidos/${idPedido}`, body);
    Alert.alert('✅ Guardado', 'Pedido actualizado correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: unknown } };
      message?: string;
    };
    console.log('PATCH error status:', err?.response?.status);
    console.log('PATCH error data:', JSON.stringify(err?.response?.data, null, 2));
    const msg = err?.response?.data?.message ?? err?.message ?? 'Error al guardar';
    Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
  } finally {
    setGuardando(false);
  }
};

  if (cargando) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Editar Pedido</Text>
          <Text style={styles.headerGuia}>{numGuia}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* DATOS BÁSICOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del Pedido</Text>
          <Text style={styles.cardSubtitle}>
            Actualiza la información del envío y del destinatario.
          </Text>

          <Text style={styles.fieldLabel}>NÚMERO DE GUÍA</Text>
          <View style={styles.trackingRow}>
            <Text style={styles.trackingValue}>{numGuia}</Text>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>

          <Text style={styles.fieldLabel}>NOMBRE DEL DESTINATARIO *</Text>
          <TextInput
            style={styles.input}
            value={destinatario}
            onChangeText={setDestinatario}
            placeholder="Nombre del destinatario"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.fieldLabel}>TELÉFONO</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Teléfono"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>PRECIO (COP)</Text>
          <TextInput
            style={styles.input}
            value={precio}
            onChangeText={setPrecio}
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>FECHA DE ENTREGA</Text>
          <TextInput
            style={styles.input}
            value={fechaEntrega}
            onChangeText={setFechaEntrega}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.fieldLabel}>DIRECCIÓN</Text>
          <Text style={styles.addressText}>{pedido?.direccion ?? 'N/A'}</Text>

          {/* FRÁGIL */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}
            onPress={() => setFragil(!fragil)}
          >
            <View style={{
              width:           22,
              height:          22,
              borderRadius:    6,
              borderWidth:     2,
              borderColor:     fragil ? COLORS.primary : COLORS.border,
              backgroundColor: fragil ? COLORS.primary : 'transparent',
              alignItems:      'center',
              justifyContent:  'center',
            }}>
              {fragil && <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' }}>
              ⚠️ Paquete frágil
            </Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, guardando ? { opacity: 0.7 } : {}]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.saveBtnText}>💾 Guardar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* ESTADO Y ASIGNACIÓN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado y Asignación</Text>

          <Text style={styles.fieldLabel}>ESTADO DEL PEDIDO</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 12 }}>
            • Actual: {pedido?.estadoPedido ?? ''}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.estadoChip, estadoElegido === e.id && styles.estadoChipActive]}
                  onPress={() => setEstadoElegido(e.id)}
                >
                  <Text style={[styles.estadoChipText, estadoElegido === e.id && styles.estadoChipTextActive]}>
                    {e.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* REPARTIDOR ACTUAL */}
          <Text style={styles.fieldLabel}>REPARTIDOR ACTUAL</Text>
          <View style={[styles.repartidorCard, { borderColor: COLORS.border }]}>
            <View style={styles.repartidorAvatar}>
              <Text style={{ color: COLORS.white, fontWeight: '700' }}>
                {typeof pedido?.usuarioRepartidor === 'string'
                  ? pedido.usuarioRepartidor.charAt(0).toUpperCase()
                  : '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.repartidorNombre}>
                {typeof pedido?.usuarioRepartidor === 'string'
                  ? pedido.usuarioRepartidor
                  : 'Sin asignar'}
              </Text>
              <Text style={styles.repartidorSub}>Repartidor asignado</Text>
            </View>
          </View>

          {/* CAMBIAR REPARTIDOR */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>CAMBIAR REPARTIDOR</Text>
          <TouchableOpacity
            style={{
              flexDirection:   'row',
              alignItems:      'center',
              padding:         14,
              borderRadius:    12,
              borderWidth:     1.5,
              borderColor:     repElegido ? COLORS.primary : COLORS.border,
              backgroundColor: repElegido ? '#FFF7F0' : COLORS.white,
              gap:             10,
              marginBottom:    12,
            }}
            onPress={() => setShowRepModal(true)}
          >
            {repElegido ? (
              <>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{repElegido.nombre.charAt(0)}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary }}>
                  {repElegido.nombre}
                </Text>
                <TouchableOpacity onPress={() => setRepElegido(null)}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>✕ Quitar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 20 }}>👥</Text>
                <Text style={{ flex: 1, fontSize: 14, color: COLORS.textMuted }}>
                  Seleccionar repartidor...
                </Text>
                <Text style={{ color: COLORS.primary }}>›</Text>
              </>
            )}
          </TouchableOpacity>

          {repElegido && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#92400E' }}>
                ⚠️ El cambio de repartidor requiere el ID del usuario. Pídele a tu jefe que exponga el endpoint de usuarios para completar esta función.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MODAL REPARTIDORES */}
      <RNModal visible={showRepModal} transparent animationType="slide" onRequestClose={() => setShowRepModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowRepModal(false)} activeOpacity={1} />
          <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: 400 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.navy, padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              Seleccionar Repartidor
            </Text>
            {repartidores.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textMuted }}>No hay repartidores disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={repartidores}
                keyExtractor={(item) => item.nombre}
                style={{ maxHeight: 300 }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
                    onPress={() => { setRepElegido(item); setShowRepModal(false); }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORES_AVATAR[index % COLORES_AVATAR.length], alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{item.nombre.charAt(0)}</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </RNModal>

    </View>
  );
}