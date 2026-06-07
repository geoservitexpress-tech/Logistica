// src/screens/admin/Operaciones/OperacionesScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { apiClient, ENDPOINTS } from '@/api';
import { COLORS } from '@/theme';
import styles from './OperacionesScreen.styles';

const TARIFA_POR_ENTREGA = 12000;
const COLORES_AVATAR = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

interface RepartidorStats {
  nombre:   string;
  entregas: number;
  recaudo:  number;
  sueldo:   number;
}

interface ProveedorStats {
  nombre:     string;
  servicios:  number;
  recaudo:    number;
  domicilios: number;
  aEntregar:  number;
}

export default function OperacionesScreen() {
  const [repartidores, setRepartidores] = useState<RepartidorStats[]>([]);
  const [proveedores,  setProveedores]  = useState<ProveedorStats[]>([]);
  const [cargando,     setCargando]     = useState<boolean>(false);
  const [refrescando,  setRefrescando]  = useState<boolean>(false);
  const [generando,    setGenerando]    = useState<boolean>(false);
  const [vista,        setVista]        = useState<'mensajeros' | 'proveedores'>('mensajeros');

  const fetchData = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const { data } = await apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL);
      const pedidos  = Array.isArray(data) ? data : [];

      // MENSAJEROS
      const mapaRep = new Map<string, RepartidorStats>();
      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioRepartidor === 'string' ? p.usuarioRepartidor : null;
        if (!nombre) return;
        if (!mapaRep.has(nombre)) mapaRep.set(nombre, { nombre, entregas: 0, recaudo: 0, sueldo: 0 });
        const rep    = mapaRep.get(nombre)!;
        const precio = parseFloat(String(p.precio ?? '0'));
        if ((p.idEstadoPedido as number) === 5) {
          rep.entregas++;
          rep.recaudo += precio;
          rep.sueldo  += TARIFA_POR_ENTREGA;
        }
      });
      setRepartidores(Array.from(mapaRep.values()));

      // PROVEEDORES
      const mapaProv = new Map<string, ProveedorStats>();
      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioSolicitud === 'string' ? p.usuarioSolicitud : null;
        if (!nombre) return;
        if (!mapaProv.has(nombre)) mapaProv.set(nombre, { nombre, servicios: 0, recaudo: 0, domicilios: 0, aEntregar: 0 });
        const prov   = mapaProv.get(nombre)!;
        const precio = parseFloat(String(p.precio ?? '0'));
        const estado = p.idEstadoPedido as number;
        prov.servicios++;
        prov.recaudo    += precio;
        prov.domicilios += TARIFA_POR_ENTREGA;
        if (estado === 5) prov.aEntregar += precio - TARIFA_POR_ENTREGA;
      });
      setProveedores(Array.from(mapaProv.values()));

    } catch (e) {
      console.log('Error operaciones', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const totalSueldo   = repartidores.reduce((acc, r) => acc + r.sueldo, 0);
  const totalEntregas = repartidores.reduce((acc, r) => acc + r.entregas, 0);
  const totalRecaudo  = repartidores.reduce((acc, r) => acc + r.recaudo, 0);

  const generarPDF = async (): Promise<void> => {
    setGenerando(true);
    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    const filasMensajeros = repartidores.map((r) => `
      <tr>
        <td>${r.nombre}</td>
        <td style="text-align:center">${r.entregas}</td>
        <td>$${Math.round(r.recaudo).toLocaleString('es-CO')}</td>
        <td>$${TARIFA_POR_ENTREGA.toLocaleString('es-CO')}</td>
        <td>$${r.sueldo.toLocaleString('es-CO')}</td>
        <td style="text-align:center">__________</td>
        <td></td>
      </tr>
    `).join('');

    const filasProveedores = proveedores.map((p) => `
      <tr>
        <td>${p.nombre}</td>
        <td style="text-align:center">${p.servicios}</td>
        <td>$${Math.round(p.recaudo).toLocaleString('es-CO')}</td>
        <td>$${p.domicilios.toLocaleString('es-CO')}</td>
        <td>$${Math.max(0, Math.round(p.aEntregar)).toLocaleString('es-CO')}</td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 24px; font-size: 11px; color: #000; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
        .header p { font-size: 11px; color: #555; margin-top: 4px; }
        .section-title { font-size: 13px; font-weight: bold; background: #0F2B46; color: #fff; padding: 6px 12px; margin: 16px 0 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f0f0f0; font-size: 10px; font-weight: bold; padding: 6px 8px; border: 1px solid #ccc; text-align: left; letter-spacing: 0.5px; }
        td { padding: 6px 8px; border: 1px solid #ccc; font-size: 10px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .total-row { font-weight: bold; background: #e8f0fe; }
        .footer { margin-top: 24px; text-align: center; font-size: 9px; color: #888; border-top: 1px solid #ccc; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GEOSERVIT EXPRESS</h1>
        <p>Control Cuentas Mensajeros — ${fecha}</p>
      </div>

      <div class="section-title">CONTROL MENSAJEROS</div>
      <table>
        <thead>
          <tr>
            <th>MENSAJERO</th>
            <th>ENTREGAS</th>
            <th>RECAUDO</th>
            <th>TARIFA</th>
            <th>SUELDO</th>
            <th>FIRMA</th>
            <th>ZONA</th>
          </tr>
        </thead>
        <tbody>
          ${filasMensajeros}
          <tr class="total-row">
            <td>TOTAL</td>
            <td style="text-align:center">${totalEntregas}</td>
            <td>$${Math.round(totalRecaudo).toLocaleString('es-CO')}</td>
            <td></td>
            <td>$${totalSueldo.toLocaleString('es-CO')}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">CONTROL PROVEEDORES</div>
      <table>
        <thead>
          <tr>
            <th>PROVEEDOR</th>
            <th>SERVICIOS</th>
            <th>TOTAL RECAUDO</th>
            <th>DOMICILIOS</th>
            <th>TOTAL A ENTREGAR</th>
          </tr>
        </thead>
        <tbody>
          ${filasProveedores}
          <tr class="total-row">
            <td>TOTAL</td>
            <td style="text-align:center">${proveedores.reduce((a, p) => a + p.servicios, 0)}</td>
            <td>$${Math.round(proveedores.reduce((a, p) => a + p.recaudo, 0)).toLocaleString('es-CO')}</td>
            <td>$${proveedores.reduce((a, p) => a + p.domicilios, 0).toLocaleString('es-CO')}</td>
            <td>$${Math.max(0, Math.round(proveedores.reduce((a, p) => a + p.aEntregar, 0))).toLocaleString('es-CO')}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        GeoServit Express · Generado el ${fecha}
      </div>
    </body>
    </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Control Mensajeros' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    } finally {
      setGenerando(false);
    }
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
        <Text style={styles.headerTitle}>Operaciones</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => fetchData(true)} colors={[COLORS.primary]} />
        }
      >
        {/* RESUMEN */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#0F2B46', borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: '#9BB4CC', fontSize: 10, fontWeight: '700' }}>ENTREGAS</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{totalEntregas}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' }}>RECAUDO</Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                ${Math.round(totalRecaudo).toLocaleString('es-CO')}
              </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#E8712A', borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' }}>SUELDO</Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
              ${Math.round(totalSueldo).toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        {/* BOTON PDF */}
        <TouchableOpacity
          style={[styles.btnPrimary, { marginBottom: 16, opacity: generando ? 0.7 : 1 }]}
          onPress={generarPDF}
          disabled={generando}
        >
          {generando
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={{ fontSize: 20 }}>📄</Text>
          }
          <Text style={styles.btnPrimaryText}>
            {generando ? 'Generando PDF...' : 'Generar PDF Control'}
          </Text>
        </TouchableOpacity>

        {/* TABS */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {([
            { key: 'mensajeros',  label: '🚴 Mensajeros' },
            { key: 'proveedores', label: '🏪 Proveedores' },
          ] as { key: 'mensajeros' | 'proveedores'; label: string }[]).map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setVista(t.key)}
              style={{
                flex:            1,
                paddingVertical: 8,
                borderRadius:    10,
                alignItems:      'center',
                backgroundColor: vista === t.key ? '#fff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: vista === t.key ? COLORS.primary : COLORS.textMuted }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TABLA MENSAJEROS */}
        {vista === 'mensajeros' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Mensajero</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Entregas</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Sueldo</Text>
            </View>
            {repartidores.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 }}>Sin datos</Text>
            ) : repartidores.map((rep, idx) => (
              <View key={rep.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{rep.nombre.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.repNombre} numberOfLines={1}>{rep.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                      Recaudo: ${Math.round(rep.recaudo).toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                  {rep.entregas}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${rep.sueldo.toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
              <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                {totalEntregas}
              </Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                ${totalSueldo.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
        )}

        {/* TABLA PROVEEDORES */}
        {vista === 'proveedores' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Proveedor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Servicios</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>A entregar</Text>
            </View>
            {proveedores.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 }}>Sin datos</Text>
            ) : proveedores.map((prov, idx) => (
              <View key={prov.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{prov.nombre.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.repNombre} numberOfLines={1}>{prov.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                      Recaudo: ${Math.round(prov.recaudo).toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                  {prov.servicios}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${Math.max(0, Math.round(prov.aEntregar)).toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
              <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                {proveedores.reduce((a, p) => a + p.servicios, 0)}
              </Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                ${Math.max(0, Math.round(proveedores.reduce((a, p) => a + p.aEntregar, 0))).toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}