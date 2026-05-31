// src/screens/repartidor/MiRuta/MiRutaScreen.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RutaStackParamList } from '@/navigation/navigation.types';
import { useRuta } from '@/context/RutaContext';
import styles from './MiRutaScreen.styles';
import { COLORS } from '@/theme';

type Props = NativeStackScreenProps<RutaStackParamList, 'MiRutaHome'>;

const BODEGA_LAT = 4.6962;
const BODEGA_LNG = -74.0858;

export default function MiRutaScreen({ navigation }: Props) {
  const { pedidos, cargando, cargarPedidos } = useRuta();

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [cargarPedidos]),
  );

  const pedidosPendientes  = pedidos.filter((p) => p.estado !== 'COMPLETADO');
  const pedidosCompletados = pedidos.filter((p) => p.estado === 'COMPLETADO');

  const abrirMaps = (lat: number, lng: number): void => {
    Alert.alert(
      'Abrir navegacion',
      'Selecciona la app de navegacion',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            ).catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps'));
          },
        },
        {
          text: 'Waze',
          onPress: () => {
            Linking.openURL(
              `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
            ).catch(() => Alert.alert('Error', 'No se pudo abrir Waze'));
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  };

  const llamarCliente = (telefono: string): void => {
    Linking.openURL(`tel:${telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo realizar la llamada'),
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.navBar}>
        <Text style={{ fontSize: 20 }}>{'[M]'}</Text>
        <Text style={styles.navTitle}>Mi Ruta</Text>
        <View style={styles.avatarMini}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>R</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarPedidos}
            colors={[COLORS.primary]}
          />
        }
      >

        {/* STATS */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: '#0F2B46', borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#9BB4CC', fontSize: 11, fontWeight: '700' }}>PENDIENTES</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{pedidosPendientes.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' }}>COMPLETADOS</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{pedidosCompletados.length}</Text>
          </View>
        </View>

        {/* BODEGA */}
        <View style={styles.bodegaCard}>
          <View style={styles.bodegaHeader}>
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 20 }}>{'[B]'}</Text>
            </View>
            <View>
              <Text style={styles.puntoLabel}>PUNTO DE PARTIDA</Text>
              <Text style={styles.bodegaNombre}>Bodega Principal Calle 80</Text>
              <Text style={styles.bodegaCiudad}>Bogota, Cundinamarca</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.wazeBtn}
            onPress={() => abrirMaps(BODEGA_LAT, BODEGA_LNG)}
          >
            <Text style={{ color: '#fff', fontSize: 16, marginRight: 8 }}>{'[NAV]'}</Text>
            <Text style={styles.wazeBtnText}>Abrir en Waze/Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* PENDIENTES */}
        <View style={styles.filterRow}>
          <Text style={styles.sectionTitle}>Pedidos a Entregar</Text>
          <Text style={{ color: '#64748B', fontSize: 13 }}>{pedidosPendientes.length} restantes</Text>
        </View>

        {pedidosPendientes.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ fontSize: 40 }}>{'[OK]'}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F2B46', marginTop: 12 }}>
              Ruta completada
            </Text>
            <Text style={{ color: '#64748B', marginTop: 4 }}>
              Todas las entregas fueron realizadas
            </Text>
          </View>
        )}

        {pedidosPendientes.map((pedido) => {
          const isActive       = pedido.estado === 'PROXIMO';
          const esRecoleccion  = pedido.tipoOperacion === 'RECOLECCION';
          return (
            <View
              key={pedido.id}
              style={[styles.deliveryCard, isActive && styles.activeCard]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.locationInfo}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>{'[P]'}</Text>
                  <Text style={styles.direccionText}>{pedido.direccion}</Text>
                </View>
                {isActive && (
                  <View style={styles.proximoBadge}>
                    <Text style={styles.proximoText}>PROXIMO</Text>
                  </View>
                )}
              </View>

              {/* TIPO OPERACION BADGE */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical:   4,
                  borderRadius:      999,
                  backgroundColor:   esRecoleccion ? '#FEF3C7' : '#DBEAFE',
                  alignSelf:         'flex-start',
                }}>
                  <Text style={{
                    fontSize:   11,
                    fontWeight: '700',
                    color:      esRecoleccion ? '#D97706' : '#1D4ED8',
                  }}>
                    {esRecoleccion ? '📦 RECOGER' : '🚚 ENTREGAR'}
                  </Text>
                </View>
              </View>

              <Text style={styles.ciudadSub}>{pedido.ciudad}</Text>

              <View style={styles.clientInfoGrid}>
                <View style={styles.infoBlock}>
                  <Text style={styles.fieldLabel}>DESTINATARIO</Text>
                  <Text style={styles.fieldValue}>{pedido.destinatario}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.fieldLabel}>TELEFONO</Text>
                  <TouchableOpacity onPress={() => llamarCliente(pedido.telefono)}>
                    <Text style={[styles.fieldValue, styles.phoneLink]}>
                      {pedido.telefono}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.observacionesBox}>
                <Text style={styles.fieldLabel}>OBSERVACIONES</Text>
                <Text style={styles.obsText}>{pedido.observacion}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {pedido.lat && pedido.lng && (
                  <TouchableOpacity
                    style={[styles.actionBtnOutline, { flex: 1 }]}
                    onPress={() => abrirMaps(pedido.lat!, pedido.lng!)}
                  >
                    <Text style={styles.actionBtnTextOutline}>Navegar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    isActive ? styles.actionBtnActive : styles.actionBtnOutline,
                    { flex: 2 },
                  ]}
                  onPress={() =>
                    navigation.navigate('ConfirmarEntrega', {
                      id:           pedido.id,
                      direccion:    pedido.direccion,
                      destinatario: pedido.destinatario,
                      telefono:     pedido.telefono,
                    })
                  }
                >
                  <Text style={isActive ? styles.actionBtnTextActive : styles.actionBtnTextOutline}>
                    {pedido.accion}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* COMPLETADOS */}
        {pedidosCompletados.length > 0 && (
          <>
            <View style={[styles.filterRow, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Completados</Text>
              <Text style={{ color: '#64748B', fontSize: 13 }}>{pedidosCompletados.length}</Text>
            </View>
            {pedidosCompletados.map((pedido) => (
              <View
                key={pedido.id}
                style={[styles.deliveryCard, { borderLeftWidth: 3, borderLeftColor: '#10B981', opacity: 0.7 }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.locationInfo}>
                    <Text style={{ fontSize: 16, marginRight: 6, color: '#10B981' }}>{'[OK]'}</Text>
                    <Text style={[styles.direccionText, { color: '#64748B' }]}>{pedido.direccion}</Text>
                  </View>
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>ENTREGADO</Text>
                  </View>
                </View>
                <Text style={styles.ciudadSub}>{pedido.destinatario}</Text>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}