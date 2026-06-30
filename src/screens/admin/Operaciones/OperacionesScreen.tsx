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

const TARIFA_POR_ENTREGA = 7000;  // Sueldo del mensajero por paquete
const DOMICILIO          = 12000; // Lo que cobra el proveedor por domicilio
const COLORES_AVATAR     = ['#E8712A', '#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0F2B46'];

interface MensajeroStats {
  fecha:                  string;
  nombre:                 string;
  totalRecolectar:        number;
  numServicios:           number;
  valorPaq:               number;
  numServiciosEspeciales: number;
  valorServicioEspecial:  number;
  servicioTotalEspecial:  number;
  sueldoServicios:        number;
  status:                 'DEBE' | 'PAGADO';
}

interface ProveedorRecoleccionStats {
  fecha:           string;
  nombre:          string;
  concepto:        string;
  cantidadServicios: number;
  totalRecoleccion: number;
  domicilios:      number;
  totalAEntregar:  number;
  fechaPago?:      string;
}

interface ProveedorMensajeriaStats {
  fecha:        string;
  nombre:       string;
  concepto:     string;
  totalACobrar: number;
}

type VistaTabla = 'mensajeros' | 'proveedoresMensajeria' | 'recoleccionContraEntrega' | 'pagoProveedores';

const formatFecha = (date: Date): string =>
  date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function OperacionesScreen() {
  const [mensajeros,             setMensajeros]             = useState<MensajeroStats[]>([]);
  const [proveedoresMensajeria,  setProveedoresMensajeria]  = useState<ProveedorMensajeriaStats[]>([]);
  const [proveedoresRecoleccion, setProveedoresRecoleccion] = useState<ProveedorRecoleccionStats[]>([]);
  const [kpis,        setKpis]        = useState<KpisPagoRepartidores | null>(null);
  const [cargando,    setCargando]    = useState<boolean>(false);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [generando,   setGenerando]   = useState<boolean>(false);
  const [dispersando, setDispersando] = useState<boolean>(false);
  const [vista,       setVista]       = useState<VistaTabla>('mensajeros');

  const fetchData = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [resPedidos, resKpis] = await Promise.all([
        apiClient.get(ENDPOINTS.PEDIDOS.GET_ALL),
        apiClient.get('/admin/pagos-repartidores/kpis').catch(() => ({ data: null })),
      ]);
      const data    = resPedidos.data;
      const pedidos = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

      setKpis(resKpis.data ?? null);

      // ===== MENSAJEROS =====
      const mapaMens = new Map<string, MensajeroStats>();
      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioRepartidor === 'string' ? p.usuarioRepartidor : null;
        if (!nombre) return;
        if (!mapaMens.has(nombre)) {
          mapaMens.set(nombre, {
            fecha:                  formatFecha(new Date()),
            nombre,
            totalRecolectar:        0,
            numServicios:           0,
            valorPaq:               TARIFA_POR_ENTREGA,
            numServiciosEspeciales: 0,
            valorServicioEspecial:  0,
            servicioTotalEspecial:  0,
            sueldoServicios:        0,
            status:                 'DEBE',
          });
        }
        const m      = mapaMens.get(nombre)!;
        const precio = parseFloat(String(p.precio ?? '0'));
        if ((p.idEstadoPedido as number) === 5) {
          m.numServicios++;
          m.totalRecolectar += precio;
          m.sueldoServicios = m.numServicios * TARIFA_POR_ENTREGA + m.servicioTotalEspecial;
        }
      });
      setMensajeros(Array.from(mapaMens.values()));

      // ===== PROVEEDORES RECOLECCIÓN CONTRA ENTREGA =====
      const mapaProv = new Map<string, ProveedorRecoleccionStats>();
      pedidos.forEach((p: Record<string, unknown>) => {
        const nombre = typeof p.usuarioSolicitud === 'string' ? p.usuarioSolicitud : null;
        if (!nombre) return;
        if (!mapaProv.has(nombre)) {
          mapaProv.set(nombre, {
            fecha:             formatFecha(new Date()),
            nombre,
            concepto:          'RECOLECCION CONTRA ENTREGA',
            cantidadServicios: 0,
            totalRecoleccion:  0,
            domicilios:        0,
            totalAEntregar:    0,
          });
        }
        const prov   = mapaProv.get(nombre)!;
        const precio = parseFloat(String(p.precio ?? '0'));
        const estado = p.idEstadoPedido as number;
        if (estado === 5) {
          prov.cantidadServicios++;
          prov.totalRecoleccion += precio;
          prov.domicilios       += DOMICILIO;
          prov.totalAEntregar    = prov.totalRecoleccion - prov.domicilios;
        }
      });
      setProveedoresRecoleccion(Array.from(mapaProv.values()));

      // ===== PROVEEDORES MENSAJERIA (vacío por ahora, falta campo en BD) =====
      setProveedoresMensajeria([]);

    } catch (e) {
      console.log('Error operaciones', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // TOTALES
  const totalServicios      = mensajeros.reduce((a, m) => a + m.numServicios, 0);
  const totalRecolectar     = mensajeros.reduce((a, m) => a + m.totalRecolectar, 0);
  const totalEspeciales     = mensajeros.reduce((a, m) => a + m.numServiciosEspeciales, 0);
  const totalSueldoServicios = mensajeros.reduce((a, m) => a + m.sueldoServicios, 0);

  const totalRecMensajeria    = proveedoresMensajeria.reduce((a, p) => a + p.totalACobrar, 0);
  const totalRecRecoleccion   = proveedoresRecoleccion.reduce((a, p) => a + p.totalRecoleccion, 0);
  const totalDomicilios       = proveedoresRecoleccion.reduce((a, p) => a + p.domicilios, 0);
  const totalAEntregar        = proveedoresRecoleccion.reduce((a, p) => a + p.totalAEntregar, 0);

  const formatCOP = (val: number): string =>
    `$${Math.round(val).toLocaleString('es-CO')}`;

  const generarDispersion = (): void => {
    Alert.alert(
      'Generar dispersión',
      `¿Confirmas generar el pago total de ${kpis ? formatCOP(kpis.totalPendientePago) : '$0'} a los repartidores?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setDispersando(true);
            try {
              await apiClient.post('/admin/pagos-repartidores/dispersion/generar');
              Alert.alert('✅ Listo', 'Dispersión generada correctamente.');
              fetchData();
            } catch (e) {
              Alert.alert('Error', 'No se pudo generar la dispersión.');
            } finally {
              setDispersando(false);
            }
          },
        },
      ],
    );
  };

  const generarPDF = async (): Promise<void> => {
    setGenerando(true);
    const fechaActual = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    const filasMensajeros = mensajeros.map((m) => `
      <tr>
        <td>${m.fecha}</td>
        <td>${m.nombre}</td>
        <td>$${Math.round(m.totalRecolectar).toLocaleString('es-CO')}</td>
        <td style="text-align:center">${m.numServicios}</td>
        <td>$${m.valorPaq.toLocaleString('es-CO')}</td>
        <td style="text-align:center">${m.numServiciosEspeciales}</td>
        <td>$${m.valorServicioEspecial.toLocaleString('es-CO')}</td>
        <td>$${m.servicioTotalEspecial.toLocaleString('es-CO')}</td>
        <td>$${m.sueldoServicios.toLocaleString('es-CO')}</td>
        <td style="text-align:center">${m.status}</td>
      </tr>
    `).join('');

    const filasRecoleccion = proveedoresRecoleccion.map((p) => `
      <tr>
        <td>${p.fecha}</td>
        <td>${p.nombre}</td>
        <td>${p.concepto}</td>
        <td style="text-align:center">${p.cantidadServicios}</td>
        <td>$${Math.round(p.totalRecoleccion).toLocaleString('es-CO')}</td>
        <td>$${p.domicilios.toLocaleString('es-CO')}</td>
        <td>$${Math.max(0, Math.round(p.totalAEntregar)).toLocaleString('es-CO')}</td>
      </tr>
    `).join('');

    const filasPagoProv = proveedoresRecoleccion.map((p) => `
      <tr>
        <td>${p.fecha}</td>
        <td>${p.nombre}</td>
        <td>$${Math.max(0, Math.round(p.totalAEntregar)).toLocaleString('es-CO')}</td>
        <td style="text-align:center">__________</td>
        <td style="text-align:center">__________</td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; color: #000; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
        .header p { font-size: 11px; color: #555; margin-top: 4px; }
        .section-title { font-size: 12px; font-weight: bold; background: #E8712A; color: #fff; padding: 6px 10px; margin: 16px 0 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #FED7AA; font-size: 9px; font-weight: bold; padding: 5px 6px; border: 1px solid #999; text-align: left; letter-spacing: 0.3px; }
        td { padding: 5px 6px; border: 1px solid #ccc; font-size: 9px; }
        tr:nth-child(even) { background: #FFF7ED; }
        .total-row { font-weight: bold; background: #FED7AA; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #888; border-top: 1px solid #ccc; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GEOSERVIT EXPRESS</h1>
        <p>Cuentas por Pagar — ${fechaActual}</p>
      </div>

      <div class="section-title">MENSAJEROS — SUELDOS</div>
      <table>
        <thead>
          <tr>
            <th>FECHA</th>
            <th>MENSAJERO</th>
            <th>TOTAL A RECOLECTAR</th>
            <th>N° SERVICIOS</th>
            <th>VALOR X PAQ</th>
            <th>N° SERV ESP</th>
            <th>VALOR SERV ESP</th>
            <th>TOTAL ESP</th>
            <th>SUELDO SERVICIOS</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          ${filasMensajeros}
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td>$${Math.round(totalRecolectar).toLocaleString('es-CO')}</td>
            <td style="text-align:center">${totalServicios}</td>
            <td></td>
            <td style="text-align:center">${totalEspeciales}</td>
            <td></td>
            <td></td>
            <td>$${totalSueldoServicios.toLocaleString('es-CO')}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">PROVEEDORES — RECOLECCION CONTRA ENTREGA</div>
      <table>
        <thead>
          <tr>
            <th>FECHA</th>
            <th>PROVEEDOR</th>
            <th>CONCEPTO</th>
            <th>CANT SERVICIOS</th>
            <th>TOTAL RECOLECCION</th>
            <th>DOMICILIOS</th>
            <th>TOTAL A ENTREGAR</th>
          </tr>
        </thead>
        <tbody>
          ${filasRecoleccion}
          <tr class="total-row">
            <td colspan="3">TOTAL</td>
            <td style="text-align:center">${proveedoresRecoleccion.reduce((a, p) => a + p.cantidadServicios, 0)}</td>
            <td>$${Math.round(totalRecRecoleccion).toLocaleString('es-CO')}</td>
            <td>$${totalDomicilios.toLocaleString('es-CO')}</td>
            <td>$${Math.max(0, Math.round(totalAEntregar)).toLocaleString('es-CO')}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">PAGO A PROVEEDORES</div>
      <table>
        <thead>
          <tr>
            <th>FECHA</th>
            <th>PROVEEDOR</th>
            <th>TOTAL A ENTREGAR</th>
            <th>FECHA DE PAGO</th>
            <th>FIRMA RECIBIDO</th>
          </tr>
        </thead>
        <tbody>
          ${filasPagoProv}
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td>$${Math.max(0, Math.round(totalAEntregar)).toLocaleString('es-CO')}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        GeoServit Express · Generado el ${fechaActual}
      </div>
    </body>
    </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Cuentas por Pagar' });
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
        {/* KPIs PAGO A REPARTIDORES */}
        {kpis && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius:    16,
            padding:         16,
            marginBottom:    16,
            borderWidth:     1,
            borderColor:     COLORS.border,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>
              💵 Pago a Repartidores
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '700' }}>PENDIENTE DE PAGO</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#0F2B46', marginTop: 2 }}>
                {formatCOP(kpis.totalPendientePago)} {kpis.moneda}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1, backgroundColor: '#DBEAFE', borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 10, color: '#2563EB', fontWeight: '700' }}>ACTIVOS</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#2563EB' }}>{kpis.repartidoresActivos}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#DCFCE7', borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700' }}>ENTREGAS HOY</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#16A34A' }}>{kpis.entregasHoy}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 10, color: '#D97706', fontWeight: '700' }}>META</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#D97706' }}>{kpis.porcentajeMetaDiaria}%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: '#0F2B46',
                paddingVertical: 12,
                borderRadius:    10,
                alignItems:      'center',
                opacity:         dispersando ? 0.7 : 1,
              }}
              onPress={generarDispersion}
              disabled={dispersando}
            >
              {dispersando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                    💸 Generar dispersión de pago
                  </Text>
              }
            </TouchableOpacity>
          </View>
        )}

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
            {generando ? 'Generando PDF...' : 'Generar PDF Cuentas por Pagar'}
          </Text>
        </TouchableOpacity>

        {/* TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {([
            { key: 'mensajeros',                label: '🚴 Mensajeros' },
            { key: 'proveedoresMensajeria',     label: '🏪 Mensajería' },
            { key: 'recoleccionContraEntrega',  label: '📦 Recol. C/Entrega' },
            { key: 'pagoProveedores',           label: '💰 Pago Proveedores' },
          ] as { key: VistaTabla; label: string }[]).map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setVista(t.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical:   8,
                borderRadius:      999,
                backgroundColor:   vista === t.key ? COLORS.primary : '#F1F5F9',
              }}
            >
              <Text style={{
                fontSize:   12,
                fontWeight: '700',
                color:      vista === t.key ? '#fff' : COLORS.textMuted,
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TABLA 1: MENSAJEROS */}
        {vista === 'mensajeros' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Mensajero</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Servicios</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2, textAlign: 'right' }]}>Sueldo</Text>
            </View>
            {mensajeros.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 }}>Sin datos</Text>
            ) : mensajeros.map((m, idx) => (
              <View key={m.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{m.nombre.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.repNombre} numberOfLines={1}>{m.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                      Recaudo: ${Math.round(m.totalRecolectar).toLocaleString('es-CO')}
                    </Text>
                    {m.numServiciosEspeciales > 0 && (
                      <Text style={{ fontSize: 10, color: '#7C3AED', fontWeight: '700' }}>
                        +{m.numServiciosEspeciales} esp. (${m.servicioTotalEspecial.toLocaleString('es-CO')})
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                  {m.numServicios}
                </Text>
                <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A' }}>
                    ${m.sueldoServicios.toLocaleString('es-CO')}
                  </Text>
                  <View style={{
                    backgroundColor:   m.status === 'PAGADO' ? '#DCFCE7' : '#FEE2E2',
                    paddingHorizontal: 6,
                    paddingVertical:   2,
                    borderRadius:      6,
                    marginTop:         2,
                  }}>
                    <Text style={{
                      fontSize:   9,
                      fontWeight: '700',
                      color:      m.status === 'PAGADO' ? '#16A34A' : '#DC2626',
                    }}>
                      {m.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
              <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                {totalServicios}
              </Text>
              <Text style={{ flex: 1.2, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                ${totalSueldoServicios.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
        )}

        {/* TABLA 2: PROVEEDORES MENSAJERIA (vacío hasta tener tipo en BD) */}
        {vista === 'proveedoresMensajeria' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Proveedor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>A cobrar</Text>
            </View>
            {proveedoresMensajeria.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>
                  Aún no hay proveedores tipo "Mensajería".
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>
                  (Falta el campo 'tipo proveedor' en la BD)
                </Text>
              </View>
            ) : proveedoresMensajeria.map((p, idx) => (
              <View key={p.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{p.nombre.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.repNombre} numberOfLines={1}>{p.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{p.concepto}</Text>
                  </View>
                </View>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${Math.round(p.totalACobrar).toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
            {proveedoresMensajeria.length > 0 && (
              <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
                <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${Math.round(totalRecMensajeria).toLocaleString('es-CO')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TABLA 3: RECOLECCION CONTRA ENTREGA */}
        {vista === 'recoleccionContraEntrega' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Proveedor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Serv</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.3, textAlign: 'right' }]}>A entregar</Text>
            </View>
            {proveedoresRecoleccion.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 }}>Sin datos</Text>
            ) : proveedoresRecoleccion.map((p, idx) => (
              <View key={p.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{p.nombre.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repNombre} numberOfLines={1}>{p.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                      Recol: ${Math.round(p.totalRecoleccion).toLocaleString('es-CO')} · Dom: ${p.domicilios.toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                  {p.cantidadServicios}
                </Text>
                <Text style={{ flex: 1.3, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${Math.max(0, Math.round(p.totalAEntregar)).toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
              <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' }}>
                {proveedoresRecoleccion.reduce((a, p) => a + p.cantidadServicios, 0)}
              </Text>
              <Text style={{ flex: 1.3, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                ${Math.max(0, Math.round(totalAEntregar)).toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
        )}

        {/* TABLA 4: PAGO A PROVEEDORES */}
        {vista === 'pagoProveedores' && (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Proveedor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.3, textAlign: 'right' }]}>A entregar</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Pago</Text>
            </View>
            {proveedoresRecoleccion.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 }}>Sin datos</Text>
            ) : proveedoresRecoleccion.map((p, idx) => (
              <View key={p.nombre} style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.avatarSmall, { backgroundColor: COLORES_AVATAR[idx % COLORES_AVATAR.length] }]}>
                    <Text style={styles.avatarText}>{p.nombre.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.repNombre} numberOfLines={1}>{p.nombre}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{p.fecha}</Text>
                  </View>
                </View>
                <Text style={{ flex: 1.3, fontSize: 12, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                  ${Math.max(0, Math.round(p.totalAEntregar)).toLocaleString('es-CO')}
                </Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {p.fechaPago ? (
                    <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700' }}>{p.fechaPago}</Text>
                  ) : (
                    <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: '700' }}>PENDIENTE</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]}>
              <Text style={{ flex: 2, fontSize: 13, fontWeight: '700', color: COLORS.navy }}>TOTAL</Text>
              <Text style={{ flex: 1.3, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>
                ${Math.max(0, Math.round(totalAEntregar)).toLocaleString('es-CO')}
              </Text>
              <View style={{ flex: 1 }} />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

interface KpisPagoRepartidores {
  totalPendientePago:                number;
  moneda:                            string;
  variacionSemanaAnteriorPorcentaje: number;
  repartidoresActivos:               number;
  entregasHoy:                       number;
  metaDiaria:                        number;
  porcentajeMetaDiaria:              number;
}