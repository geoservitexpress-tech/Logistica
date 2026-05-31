// src/screens/admin/Operaciones/OperacionesScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '@/theme';
import styles from './OperacionesScreen.styles';

const REPARTIDORES = [
  { id: 'RP-8842', nombre: 'Juan Rodríguez', sub: 'Moto • Bogotá Norte',    entregas: 142, color: '#E8712A' },
  { id: 'RP-9102', nombre: 'María Arango',   sub: 'Van • Bogotá Centro',    entregas: 215, color: '#2563EB' },
  { id: 'RP-7721', nombre: 'Carlos Holguín', sub: 'Bicicleta • Teusaquillo', entregas: 89,  color: '#16A34A' },
  { id: 'RP-6650', nombre: 'Lina Gutiérrez', sub: 'Moto • Chapinero',       entregas: 164, color: '#7C3AED' },
];

export default function OperacionesScreen() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = REPARTIDORES.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.id.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1, marginBottom: 4 }}>
          PAGOS A REPARTIDORES
        </Text>
        <Text style={styles.pageTitle}>Pago a Repartidores</Text>
        <Text style={styles.tagLine}>
          Gestión de comisiones y dispersión de fondos para la flota de Bogotá.
        </Text>

        <TouchableOpacity
          style={[styles.btnPrimary, { marginBottom: SPACING_LG }]}
          onPress={() => Alert.alert('Dispersión Total', 'Función próximamente disponible.')}
        >
          <Text style={{ fontSize: 20 }}>💳</Text>
          <Text style={styles.btnPrimaryText}>Generar Dispersión Total</Text>
        </TouchableOpacity>

        {/* TOTAL PENDIENTE */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>TOTAL PENDIENTE DE PAGO</Text>
            <View style={[styles.kpiIconBox]}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>$45.280.000 COP</Text>
          <Text style={[styles.kpiSub, { color: COLORS.primary }]}>↑ +12% vs semana anterior</Text>
        </View>

        {/* REPARTIDORES ACTIVOS */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>REPARTIDORES ACTIVOS</Text>
          <Text style={styles.kpiValue}>1</Text>
        </View>

        {/* ENTREGAS HOY */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ENTREGAS HOY</Text>
          <Text style={styles.kpiValue}>0</Text>
          <View style={{
            height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginTop: 8, overflow: 'hidden',
          }}>
            <View style={{ width: '0%', height: 6, backgroundColor: COLORS.navy, borderRadius: 3 }} />
          </View>
          <Text style={styles.kpiSub}>0% de la meta diaria alcanzada</Text>
        </View>

        {/* BUSQUEDA */}
        <View style={styles.searchWrap}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o ID de repartidor..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* TABLA */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Repartidor</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ID</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Entregas</Text>
          </View>

          {filtrados.map((rep) => (
            <View key={rep.id} style={styles.tableRow}>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.avatarSmall, { backgroundColor: rep.color }]}>
                  <Text style={styles.avatarText}>{rep.nombre.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.repNombre}>{rep.nombre}</Text>
                  <Text style={styles.repSub}>{rep.sub}</Text>
                </View>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary }}>{rep.id}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'right' }}>
                {rep.entregas}
              </Text>
            </View>
          ))}

          <View style={styles.pagination}>
            <Text style={styles.paginationText}>Mostrando 1-{filtrados.length} de {REPARTIDORES.length} repartidores</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.paginationBtn}>
                <Text>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paginationBtn}>
                <Text>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const SPACING_LG = 20;