// src/components/modals/GuiaModal/GuiaModal.tsx

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/theme';
import { PedidoGuia } from '@/types/pedido.types';

interface GuiaModalProps {
  visible:     boolean;
  pedido:      PedidoGuia | null;
  onConfirmar: (fotoUri: string) => void;
  onCerrar:    () => void;
}

const generarHTML = (pedido: PedidoGuia): string => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; padding: 32px; color: #000; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.logo { font-size: 22px; font-weight: bold; letter-spacing: 1px; }
.badge { background: #000; color: #fff; font-weight: bold; font-size: 12px; padding: 4px 14px; border-radius: 4px; letter-spacing: 1px; }
.badge-fragil { background: #CC0000; }
.divider { height: 2px; background: #000; margin: 14px 0; }
.divider-thin { height: 1px; background: #000; margin: 12px 0; }
.guia-label { font-size: 10px; font-weight: bold; color: #CC0000; letter-spacing: 3px; margin-bottom: 4px; }
.guia-num { font-size: 30px; font-weight: bold; letter-spacing: 2px; }
.row { display: flex; gap: 20px; margin-top: 10px; }
.col { flex: 1; }
.field-label { font-size: 9px; font-weight: bold; color: #CC0000; letter-spacing: 2px; margin-bottom: 3px; text-transform: uppercase; }
.field-val { font-size: 13px; font-weight: 500; }
.field-val-lg { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
.obs-box { border: 1px solid #000; padding: 10px; margin-top: 8px; font-size: 13px; }
.footer { margin-top: 28px; text-align: center; font-size: 10px; border-top: 2px solid #000; padding-top: 12px; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="header">
  <span class="logo">GEOSERVIT EXPRESS</span>
  <span class="badge ${pedido.fragil ? 'badge-fragil' : ''}">${pedido.fragil ? 'FRAGIL' : 'ESTANDAR'}</span>
</div>
<div class="divider"></div>
<div class="guia-label">NUMERO DE GUIA</div>
<div class="guia-num">${pedido.id}</div>
<div class="divider"></div>
<div class="row">
  <div class="col">
    <div class="field-label">REMITENTE</div>
    <div class="field-val">${pedido.companyName ?? 'N/A'}</div>
  </div>
  <div class="col">
    <div class="field-label">FECHA</div>
    <div class="field-val">${pedido.fecha ?? ''}</div>
  </div>
</div>
<div class="divider-thin"></div>
<div class="field-label">DESTINATARIO</div>
<div class="field-val-lg">${pedido.destinatario}</div>
<div class="field-label">TELEFONO</div>
<div class="field-val">${pedido.telefono ?? 'N/A'}</div>
<div class="divider-thin"></div>
<div class="field-label">DIRECCION DE ENTREGA</div>
<div class="field-val-lg">${pedido.destino}</div>
<div class="divider-thin"></div>
<div class="row">
  <div class="col">
    <div class="field-label">PESO</div>
    <div class="field-val">${pedido.weight ?? '0'} KG</div>
  </div>
  <div class="col">
    <div class="field-label">VALOR DECLARADO</div>
    <div class="field-val">$ ${pedido.declaredValue ?? '0'}</div>
  </div>
  <div class="col">
    <div class="field-label">METODO</div>
    <div class="field-val">${pedido.metodoEntrega ?? 'N/A'}</div>
  </div>
</div>
${pedido.manifestObs ? `
<div class="divider-thin"></div>
<div class="field-label">OBSERVACIONES</div>
<div class="obs-box">${pedido.manifestObs}</div>
` : ''}
<div class="footer">GLOBALLOGISTICS · ${pedido.id} · ${new Date().toLocaleString('es-CO')}</div>
</body>
</html>
`;

export default function GuiaModal({ visible, pedido, onConfirmar, onCerrar }: GuiaModalProps) {
  const [fotoGuia,       setFotoGuia]       = useState<string | null>(null);
  const [descargando,    setDescargando]    = useState<boolean>(false);
  const [guiaDescargada, setGuiaDescargada] = useState<boolean>(false);

  const descargarPDF = async (): Promise<void> => {
    if (!pedido) return;
    try {
      setDescargando(true);
      const { uri } = await Print.printToFileAsync({ html: generarHTML(pedido) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      setGuiaDescargada(true);
    } catch {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setDescargando(false);
    }
  };

  const tomarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a la camara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setFotoGuia(result.assets[0].uri);
  };

  const seleccionarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a la galeria');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) setFotoGuia(result.assets[0].uri);
  };

  const handleConfirmar = (): void => {
    if (!guiaDescargada) {
      Alert.alert('Descarga requerida', 'Primero descarga la guia');
      return;
    }
    if (!fotoGuia) {
      Alert.alert('Foto requerida', 'Debes subir una foto');
      return;
    }
    onConfirmar(fotoGuia);
    setFotoGuia(null);
    setGuiaDescargada(false);
  };

  const handleCerrar = (): void => {
    setFotoGuia(null);
    setGuiaDescargada(false);
    onCerrar();
  };

  if (!pedido) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCerrar}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Guia de envio</Text>
            <TouchableOpacity onPress={handleCerrar}>
              <Text style={styles.close}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <View style={styles.card}>
              <Text style={styles.label}>GUIA</Text>
              <Text style={styles.id}>{pedido.id}</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>DESTINATARIO</Text>
              <Text style={styles.value}>{pedido.destinatario}</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>DESTINO</Text>
              <Text style={styles.value}>{pedido.destino}</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>TELEFONO</Text>
              <Text style={styles.value}>{pedido.telefono || 'N/A'}</Text>
              {pedido.weight && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>PESO</Text>
                  <Text style={styles.value}>{pedido.weight} KG</Text>
                </>
              )}
              {pedido.declaredValue && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>VALOR DECLARADO</Text>
                  <Text style={styles.value}>$ {pedido.declaredValue}</Text>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={descargarPDF}>
              {descargando
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.downloadText}>Descargar PDF</Text>
              }
            </TouchableOpacity>

            {guiaDescargada && (
              <>
                {fotoGuia ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: fotoGuia }} style={styles.preview} />
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setFotoGuia(null)}>
                      <Text style={styles.secondaryText}>Cambiar foto</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.photoButtons}>
                    <TouchableOpacity style={styles.photoBtn} onPress={tomarFoto}>
                      <Text style={styles.photoBtnText}>Camara</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={seleccionarFoto}>
                      <Text style={[styles.photoBtnText, { color: COLORS.textPrimary }]}>Galeria</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, (!fotoGuia || !guiaDescargada) && styles.disabledBtn]}
              onPress={handleConfirmar}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  close: { fontSize: 20, color: COLORS.textSecondary, fontWeight: '700' },
  content: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginBottom: 4 },
  id: { ...TYPOGRAPHY.h2, color: COLORS.navy },
  value: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  downloadBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  downloadText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.white },
  previewWrap: { alignItems: 'center' },
  preview: { width: '100%', height: 220, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  secondaryBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
  },
  secondaryText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.primary },
  photoButtons: { flexDirection: 'row', gap: SPACING.md },
  photoBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  photoBtnSecondary: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  photoBtnText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.white },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.white },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: COLORS.textMuted },
  confirmText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.white },
});