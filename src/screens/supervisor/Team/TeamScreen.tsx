// src/screens/supervisor/Team/TeamScreen.tsx

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
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './TeamScreen.styles';

interface PedidoResumen {
  idPedido:       number;
  numGuia:        string;
  estadoPedido:   string;
  idEstadoPedido: number;
  direccion:      string;
  tipoOperacion:  string;
}

interface RepartidorStats {
  nombre:       string;
  asignados:    number;
  entregados:   number;
  noEntregados: number;
  enCamino:     number;
  pedidos:      PedidoResumen[];
}

const ESTADO_COLOR: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#F3F4F6', text: '#6B7280', label: 'Creado' },
  2: { bg: '#FEF3C7', text: '#D97706', label: 'Asignado' },
  3: { bg: '#DBEAFE', text: '#2563EB', label: 'Recibido' },
  4: { bg: '#DBEAFE', text: '#2563EB', label: 'En curso' },
  5: { bg: '#DCFCE7', text: '#16A34A', label: 'Entregado' },
  6: { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelado' },
  7: { bg: '#FEE2E2', text: '#DC2626', label: 'No entregado' },
};

export default function TeamScreen() {
  const [repartidores,  setRepartidores]  = useState<RepartidorStats[]>([]);
  const [cargando,      setCargando]      = useState<boolean>(false);
  const [refrescando,   setRefrescando]   = useState<boolean>(false);
  const [expandidos,    setExpandidos]    = useState<Set<string>>(new Set());

  const fetchTeam = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      const pedidos  = Array.isArray(data) ? data : [];

      const mapaReps = new Map<string, RepartidorStats>();

      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioRepartidor === 'string' ? p.usuarioRepartidor : null;
        if (!nombre) return;

        if (!mapaReps.has(nombre)) {
          mapaReps.set(nombre, {
            nombre,
            asignados:    0,
            entregados:   0,
            noEntregados: 0,
            enCamino:     0,
            pedidos:      [],
          });
        }

        const rep    = mapaReps.get(nombre)!;
        const estado = (p.idEstadoPedido as number) ?? 0;

        rep.asignados++;
        if (estado === 5) rep.entregados++;
        else if (estado === 7) rep.noEntregados++;
        else if (estado === 3 || estado === 4) rep.enCamino++;

        rep.pedidos.push({
          idPedido:       p.idPedido as number,
          numGuia:        p.numGuia as string,
          estadoPedido:   p.estadoPedido as string,
          idEstadoPedido: estado,
          direccion:      p.direccion as string,
          tipoOperacion:  p.tipoOperacion as string,
        });
      });

      setRepartidores(Array.from(mapaReps.values()));
    } catch (e) {
      console.log('Error team', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchTeam(); }, [fetchTeam]));

  const toggleExpandir = (nombre: string): void => {
    setExpandidos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(nombre)) nuevo.delete(nombre);
      else nuevo.add(nombre);
      return nuevo;
    });
  };

  const COLORES_AVATAR = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => fetchTeam(true)}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Equipo</Text>
        <Text style={styles.headerSubtitle}>Progreso de repartidores</Text>
      </View>

      {cargando && (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      )}

      {!cargando && repartidores.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No hay repartidores con pedidos</Text>
        </View>
      )}

      {!cargando && repartidores.map((rep, idx) => {
        const terminados  = rep.entregados + rep.noEntregados;
        const progreso    = rep.asignados > 0 ? Math.round((terminados / rep.asignados) * 100) : 0;
        const bgAvatar    = COLORES_AVATAR[idx % COLORES_AVATAR.length];
        const expandido   = expandidos.has(rep.nombre);

        return (
          <View key={rep.nombre} style={styles.repCard}>
            <View style={styles.repHeader}>
              <View style={[styles.repAvatar, { backgroundColor: bgAvatar }]}>
                <Text style={styles.repAvatarText}>{rep.nombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.repNombre}>{rep.nombre}</Text>
                <Text style={styles.repRol}>Repartidor</Text>
              </View>
              <View style={[
                styles.repStatusBadge,
                { backgroundColor: rep.enCamino > 0 ? '#DBEAFE' : '#F3F4F6' },
              ]}>
                <Text style={[styles.repStatusText, { color: rep.enCamino > 0 ? '#2563EB' : '#6B7280' }]}>
                  {rep.enCamino > 0 ? '🚚 En ruta' : '✅ Disponible'}
                </Text>
              </View>
            </View>

            {/* STATS */}
            <View style={styles.repStats}>
              <View style={styles.repStatItem}>
                <Text style={styles.repStatValue}>{rep.asignados}</Text>
                <Text style={styles.repStatLabel}>Total</Text>
              </View>
              <View style={styles.repStatItem}>
                <Text style={[styles.repStatValue, { color: '#2563EB' }]}>{rep.enCamino}</Text>
                <Text style={styles.repStatLabel}>En ruta</Text>
              </View>
              <View style={styles.repStatItem}>
                <Text style={[styles.repStatValue, { color: '#16A34A' }]}>{rep.entregados}</Text>
                <Text style={styles.repStatLabel}>Entregados</Text>
              </View>
              <View style={styles.repStatItem}>
                <Text style={[styles.repStatValue, { color: '#DC2626' }]}>{rep.noEntregados}</Text>
                <Text style={styles.repStatLabel}>No entregados</Text>
              </View>
            </View>

            {/* PROGRESO */}
            <View style={styles.progresoWrap}>
              <View style={styles.progresoBar}>
                <View style={[styles.progresoFill, { width: `${progreso}%` as `${number}%` }]} />
              </View>
              <Text style={styles.progresoText}>{progreso}%</Text>
            </View>

            {/* BOTON VER PEDIDOS */}
            <TouchableOpacity
              onPress={() => toggleExpandir(rep.nombre)}
              style={{
                marginTop:       12,
                paddingVertical: 8,
                borderTopWidth:  1,
                borderTopColor:  COLORS.border,
                flexDirection:   'row',
                justifyContent:  'center',
                alignItems:      'center',
                gap:             6,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>
                {expandido ? 'Ocultar pedidos' : `Ver ${rep.pedidos.length} pedidos`}
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>
                {expandido ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {/* PEDIDOS EXPANDIDOS */}
            {expandido && (
              <View style={{ marginTop: 8 }}>
                {rep.pedidos.map((pedido) => {
                  const cfg = ESTADO_COLOR[pedido.idEstadoPedido] ?? { bg: '#F3F4F6', text: '#6B7280', label: pedido.estadoPedido };
                  return (
                    <View key={pedido.idPedido} style={{
                      flexDirection:     'row',
                      alignItems:        'center',
                      paddingVertical:   10,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.border,
                      gap:               8,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.navy }}>
                          {pedido.numGuia}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }} numberOfLines={1}>
                          {pedido.direccion}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                          {pedido.tipoOperacion === 'RECOLECCION' ? '📦 Recoger' : '🚚 Entregar'}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor:   cfg.bg,
                        borderRadius:      999,
                        paddingHorizontal: 8,
                        paddingVertical:   4,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.text }}>
                          {cfg.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}