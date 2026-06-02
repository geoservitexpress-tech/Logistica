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
}

const ESTADOS = [
  { id: 1, nombre: 'Creado' },
  { id: 2, nombre: 'Asignado' },
  { id: 3, nombre: 'Recibido' },
  { id: 4, nombre: 'En curso' },
  { id: 5, nombre: 'Entregado' },
  { id: 7, nombre: 'No entregado' },
];

export default function EditOrderScreen({ navigation, route }: Props) {
  const { idPedido, numGuia } = route.params;

  const [pedido,        setPedido]        = useState<PedidoDetalle | null>(null);
  const [estadoElegido, setEstadoElegido] = useState<number>(1);
  const [destinatario,  setDestinatario]  = useState<string>('');
  const [telefono,      setTelefono]      = useState<string>('');
  const [cargando,      setCargando]      = useState<boolean>(true);
  const [guardando,     setGuardando]     = useState<boolean>(false);

  useEffect(() => { cargarDatos(); }, []);

  const getNombre = (val: string | null | object): string => {
    if (typeof val === 'string') return val;
    return '';
  };

  const cargarDatos = async (): Promise<void> => {
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_BY_ID(idPedido));
      const p = data as PedidoDetalle;
      setPedido(p);
      setEstadoElegido(p.idEstadoPedido ?? 1);
      setDestinatario(getNombre(p.destinatarioNombre));
      setTelefono(getNombre(p.destinatarioTelefono));
    } catch (e) {
      console.log('Error cargando pedido', e);
      Alert.alert('Error', 'No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (): Promise<void> => {
    setGuardando(true);
    try {
      await apiClient.patch(`/supervisor/pedidos/${idPedido}`, {
        idEstadoPedido:       estadoElegido,
        nombreDestinatario:   destinatario  || undefined,
        telefonoDestinatario: telefono      || undefined,
      });

      Alert.alert('Guardado', 'Pedido actualizado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: unknown } }; message?: string };
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
          <Text style={styles.headerTitle}>Edit Order</Text>
          <Text style={styles.headerGuia}>{numGuia}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ORDER DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <Text style={styles.cardSubtitle}>
            Update the shipment information and recipient details below.
          </Text>

          <Text style={styles.fieldLabel}>TRACKING NUMBER</Text>
          <View style={styles.trackingRow}>
            <Text style={styles.trackingValue}>{numGuia}</Text>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>

          <Text style={styles.fieldLabel}>RECIPIENT NAME *</Text>
          <TextInput
            style={styles.input}
            value={destinatario}
            onChangeText={setDestinatario}
            placeholder="Nombre del destinatario"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.fieldLabel}>TELEFONO</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Telefono"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>DELIVERY ADDRESS</Text>
          <Text style={styles.addressText}>{pedido?.direccion ?? 'N/A'}</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, guardando && { opacity: 0.7 }]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.saveBtnText}>💾 Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status & Assignment</Text>

          <Text style={styles.fieldLabel}>ORDER STATUS</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 12 }}>
            • Current: {pedido?.estadoPedido ?? ''}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={[
                    styles.estadoChip,
                    estadoElegido === e.id && styles.estadoChipActive,
                  ]}
                  onPress={() => setEstadoElegido(e.id)}
                >
                  <Text style={[
                    styles.estadoChipText,
                    estadoElegido === e.id && styles.estadoChipTextActive,
                  ]}>
                    {e.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* COURIER ACTUAL */}
          <Text style={styles.fieldLabel}>COURIER ACTUAL</Text>
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
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}