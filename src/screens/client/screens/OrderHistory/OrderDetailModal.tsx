import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, ScrollView, Alert, Image } from 'react-native';
import { COLORS } from '@/theme';
import styles from './OrderDetailModal.styles';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OrderEstado = 'entregado' | 'transito' | 'pendiente' | 'espera' | 'recogida';

export interface Order {
  id: string;
  estado: OrderEstado;
  fechaEntrega?: string;
  fecha?: string;
  destinatario: string;
  telefono?: string;
  origen?: string;
  destino: string;
  companyName?: string;
  mensajero?: string;
  pago?: string;
  estadoPago?: string;
  metodoEntrega?: string;
  weight?: string | number;
  declaredValue?: string | number;
  fragil?: boolean;
  manifestObs?: string;
  fotos?: string[];
  observacionesEntrega?: string;
}

interface BadgeConfig {
  style: object;
  textStyle: object;
  label: string;
}

interface OrderDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function OrderDetailModal({ visible, order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const isEntregado: boolean = order.estado === 'entregado';
  const isTransito: boolean  = order.estado === 'transito';

  const getBadge = (): BadgeConfig => {
    if (isEntregado) return { style: styles.badgeSuccess, textStyle: styles.badgeSuccessText, label: '✅ Entregado' };
    if (isTransito)  return { style: styles.badgeTransit, textStyle: styles.badgeTransitText, label: '🔄 En Tránsito' };
    return                  { style: styles.badgePending,  textStyle: styles.badgePendingText,  label: '⏳ Pendiente' };
  };

  const badge: BadgeConfig = getBadge();

  const descargarGuia = async (): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 32px; color: #000000; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .logo { font-size: 22px; font-weight: bold; color: #000000; letter-spacing: 1px; }
        .badge { background: #000000; color: #ffffff; font-weight: bold; font-size: 12px; padding: 4px 14px; border-radius: 4px; letter-spacing: 1px; }
        .badge-fragil { background: #CC0000; }
        .divider { height: 2px; background: #000000; margin: 14px 0; }
        .divider-thin { height: 1px; background: #000000; margin: 12px 0; }
        .guia-num-label { font-size: 10px; font-weight: bold; color: #CC0000; letter-spacing: 3px; margin-bottom: 4px; }
        .guia-num { font-size: 30px; font-weight: bold; color: #000000; letter-spacing: 2px; }
        .row { display: flex; gap: 20px; margin-top: 10px; }
        .col { flex: 1; }
        .field-label { font-size: 9px; font-weight: bold; color: #CC0000; letter-spacing: 2px; margin-bottom: 3px; text-transform: uppercase; }
        .field-val { font-size: 13px; font-weight: 500; color: #000000; }
        .field-val-lg { font-size: 18px; font-weight: bold; color: #000000; margin-bottom: 4px; }
        .obs-box { border: 1px solid #000000; padding: 10px; margin-top: 8px; font-size: 13px; color: #000000; }
        .footer { margin-top: 28px; text-align: center; font-size: 10px; color: #000000; border-top: 2px solid #000000; padding-top: 12px; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="logo">LOGISTICS PRO</span>
        <span class="badge ${order.fragil ? 'badge-fragil' : ''}">${order.fragil ? 'FRÁGIL' : 'ESTÁNDAR'}</span>
      </div>
      <div class="divider"></div>
      <div class="guia-num-label">NÚMERO DE GUÍA</div>
      <div class="guia-num">${order.id}</div>
      <div class="divider"></div>
      <div class="row">
        <div class="col">
          <div class="field-label">REMITENTE</div>
          <div class="field-val">${order.companyName ?? 'N/A'}</div>
        </div>
        <div class="col">
          <div class="field-label">CIUDAD ORIGEN</div>
          <div class="field-val">${order.origen ?? 'Bogotá, CO'}</div>
        </div>
        <div class="col">
          <div class="field-label">FECHA</div>
          <div class="field-val">${order.fecha ?? ''}</div>
        </div>
      </div>
      <div class="divider-thin"></div>
      <div class="field-label">DESTINATARIO</div>
      <div class="field-val-lg">${order.destinatario}</div>
      <div class="field-label">TELÉFONO</div>
      <div class="field-val">${order.telefono ?? 'N/A'}</div>
      <div class="divider-thin"></div>
      <div class="field-label">DIRECCIÓN DE ENTREGA</div>
      <div class="field-val-lg">${order.destino}</div>
      <div class="divider-thin"></div>
      <div class="row">
        <div class="col">
          <div class="field-label">PESO</div>
          <div class="field-val">${order.weight ?? '—'} KG</div>
        </div>
        <div class="col">
          <div class="field-label">VALOR DECLARADO</div>
          <div class="field-val">$ ${order.declaredValue ?? '0'}</div>
        </div>
        <div class="col">
          <div class="field-label">MÉTODO DE PAGO</div>
          <div class="field-val">${order.pago ?? 'N/A'}</div>
        </div>
        <div class="col">
          <div class="field-label">MÉTODO ENTREGA</div>
          <div class="field-val">${order.metodoEntrega ?? 'N/A'}</div>
        </div>
      </div>
      ${order.manifestObs ? `
      <div class="divider-thin"></div>
      <div class="field-label">OBSERVACIONES</div>
      <div class="obs-box">${order.manifestObs}</div>
      ` : ''}
      <div class="footer">
        LOGISTICS PRO · ${order.id} · ${new Date().toLocaleString('es-CO')}
      </div>
    </body>
    </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Guía ${order.id}` });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar la guía.');
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalle del Pedido</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Estado */}
            <View style={styles.statusRow}>
              <View style={[styles.badge, badge.style]}>
                <Text style={[styles.badgeText, badge.textStyle]}>{badge.label}</Text>
              </View>
              {isEntregado && order.fechaEntrega && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateText}>{order.fechaEntrega}</Text>
                </View>
              )}
            </View>

            {/* Mensajero */}
            {order.mensajero && (
              <>
                <Text style={styles.sectionLabel}>MENSAJERO</Text>
                <View style={styles.courierCard}>
                  <View style={styles.courierAvatar}>
                    <Text style={styles.courierAvatarText}>{order.mensajero.charAt(0)}</Text>
                  </View>
                  <View style={styles.courierInfo}>
                    <Text style={styles.courierName}>{order.mensajero}</Text>
                    <Text style={styles.courierRole}>Mensajero activo</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Alert.alert('Llamar', `Llamando a ${order.mensajero}...`)}
                  >
                    <Text>📞</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Destinatario */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <Text>👤</Text>
                <Text style={styles.infoCardTitle}>Destinatario</Text>
              </View>
              <Text style={styles.infoName}>{order.destinatario}</Text>
              {order.telefono && <Text style={styles.infoPhone}>{order.telefono}</Text>}
            </View>

            {/* Pago */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <Text>💳</Text>
                <Text style={styles.infoCardTitle}>Método de Pago</Text>
              </View>
              <Text style={styles.paymentMethod}>{order.pago}</Text>
              <Text style={styles.paymentStatus}>{order.estadoPago}</Text>
            </View>

            {/* Ruta */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <Text>📍</Text>
                <Text style={styles.infoCardTitle}>Ruta</Text>
              </View>
              <Text style={styles.routeText}>{order.origen ?? 'Bogotá, CO'} → {order.destino}</Text>
            </View>

            {/* Fotos si tiene */}
            {order.fotos && order.fotos.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>FOTOS DEL PAQUETE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {order.fotos.map((uri: string, i: number) => (
                    <Image key={i} source={{ uri }} style={{ width: 90, height: 90, borderRadius: 8 }} />
                  ))}
                </View>
              </>
            )}

            {/* Evidencia si entregado */}
            {isEntregado && !order.fotos?.length && (
              <>
                <Text style={styles.sectionLabel}>EVIDENCIA DE ENTREGA</Text>
                <View style={styles.evidenceRow}>
                  {[0, 1].map((i: number) => (
                    <View key={i} style={styles.evidenceThumb}>
                      <Text style={{ fontSize: 30 }}>📷</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Acciones */}
          <View style={styles.actionsWrap}>
            <TouchableOpacity style={styles.primaryBtn} onPress={descargarGuia} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>⬇️ Descargar Guía</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RNModal>
  );
}
