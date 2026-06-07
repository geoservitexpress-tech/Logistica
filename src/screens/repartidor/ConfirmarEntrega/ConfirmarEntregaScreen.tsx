// src/screens/repartidor/ConfirmarEntrega/ConfirmarEntregaScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import type { RutaStackParamList } from '@/navigation/navigation.types';
import { useRuta } from '@/context/RutaContext';
import { apiClient } from '@/api';
import styles from './ConfirmarEntregaScreen.styles';

type Props = NativeStackScreenProps<RutaStackParamList, 'ConfirmarEntrega'>;

const METODOS_PAGO = [
  { id: 1, label: 'Efectivo' },
  { id: 2, label: 'Transferencia' },
  { id: 3, label: 'Bre-B' },
  { id: 4, label: 'Datafono' },
  { id: 5, label: 'Nequi' },
  { id: 6, label: 'Daviplata' },
  { id: 7, label: 'QR / Link de pago' },
];

export default function ConfirmarEntregaScreen({ navigation, route }: Props) {
  const { id, direccion, destinatario, telefono, pagadoPorRemitente, precio, tipoOperacion } = route.params;
  const { completarPedido } = useRuta();

  const esRecoleccion  = tipoOperacion === 'RECOLECCION';
  const yaEstaPagado   = pagadoPorRemitente === true;
  const valorACobrar   = precio ?? 0;

  const RESULTADOS = esRecoleccion
    ? [
        { id: 1, label: 'Recogido exitosamente' },
        { id: 3, label: 'No se pudo recoger' },
      ]
    : [
        { id: 1, label: 'Exitoso' },
        { id: 3, label: 'No entregado' },
      ];

  const [observaciones, setObservaciones] = useState<string>('');
  const [idResultado,   setIdResultado]   = useState<number>(1);
  const [idMetodoPago,  setIdMetodoPago]  = useState<number>(1);
  const [fotoUri,       setFotoUri]       = useState<string | null>(null);
  const [enviando,      setEnviando]      = useState<boolean>(false);

  const tomarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a la camara.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const seleccionarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a la galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const handleConfirmar = async (): Promise<void> => {
    const esNoEntrega = idResultado === 3 || idResultado === 4;

    if (!fotoUri && !esNoEntrega) {
      Alert.alert('Foto requerida', 'Debes tomar una foto como evidencia.');
      return;
    }

    setEnviando(true);
    try {
      try {
        await apiClient.post(`/repartidor/pedidos/${id}/aceptar`);
      } catch (e: unknown) {
        const err = e as { response?: { status?: number } };
        if (err?.response?.status !== 409) throw e;
      }

      let base64: string | null = null;
      if (fotoUri) {
        const response = await fetch(fotoUri);
        const blob     = await response.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader   = new FileReader();
          reader.onload  = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const body: Record<string, unknown> = {
        idResultadoEntrega: idResultado,
        pagadoPorRemitente: yaEstaPagado,
        idMetodoPago,
        valorRecaudado:     yaEstaPagado ? 0 : valorACobrar,
        observaciones:      observaciones || undefined,
      };

      if (base64) body.fotosEntregaBase64 = [base64];

      await apiClient.post(`/repartidor/pedidos/${id}/confirmar-entrega`, body);
      completarPedido(id);

      Alert.alert(
        esNoEntrega
          ? (esRecoleccion ? '❌ No se pudo recoger' : '❌ No entregado')
          : (esRecoleccion ? '✅ Recogida confirmada' : '✅ Entrega confirmada'),
        esNoEntrega
          ? (esRecoleccion
              ? 'Se registró que no se pudo recoger el paquete.'
              : 'Se registró que el pedido no pudo ser entregado.')
          : (esRecoleccion
              ? `La recogida #${id} fue registrada. El pedido pasará a entrega.`
              : `La entrega #${id} fue registrada correctamente.`),
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: unknown } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al confirmar';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: '#0F172A' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {esRecoleccion ? 'Confirmar Recogida' : 'Confirmar Entrega'}
        </Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* INFO */}
        <View style={styles.card}>
          <View style={[styles.badge, { backgroundColor: esRecoleccion ? '#FEF3C7' : '#DBEAFE' }]}>
            <Text style={[styles.badgeText, { color: esRecoleccion ? '#D97706' : '#2563EB' }]}>
              {esRecoleccion ? '📦 RECOLECCIÓN' : '🚚 ENTREGA'} #{id}
            </Text>
          </View>
          <Text style={styles.title}>
            {esRecoleccion ? 'Confirmar Recogida' : 'Confirmar Entrega'}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.label}>DESTINATARIO</Text>
          <Text style={styles.value}>{destinatario ?? 'N/A'}</Text>
          <Text style={styles.label}>DIRECCIÓN</Text>
          <Text style={styles.value}>{direccion ?? 'N/A'}</Text>
          {telefono && (
            <>
              <Text style={styles.label}>TELÉFONO</Text>
              <Text style={styles.value}>{telefono}</Text>
            </>
          )}
        </View>

        {/* ESTADO DE PAGO — solo para entregas */}
        {!esRecoleccion && (
          <View style={[styles.card, {
            backgroundColor: yaEstaPagado ? '#DCFCE7' : '#FEF3C7',
            borderWidth:     1,
            borderColor:     yaEstaPagado ? '#86EFAC' : '#FDE68A',
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>{yaEstaPagado ? '✅' : '💵'}</Text>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: yaEstaPagado ? '#15803D' : '#92400E' }}>
                  {yaEstaPagado ? 'Este pedido ya está pagado' : 'Debes cobrar al entregar'}
                </Text>
                {!yaEstaPagado && valorACobrar > 0 && (
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#D97706', marginTop: 4 }}>
                    ${valorACobrar.toLocaleString('es-CO')} COP
                  </Text>
                )}
                {yaEstaPagado && (
                  <Text style={{ fontSize: 13, color: '#15803D', marginTop: 2 }}>
                    No es necesario cobrar nada al destinatario
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* FOTO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {esRecoleccion ? 'Foto del Paquete' : 'Foto de Entrega'}{' '}
            {idResultado !== 3 && idResultado !== 4 ? '*' : '(Opcional)'}
          </Text>
          <Text style={styles.sectionDescription}>
            {esRecoleccion
              ? 'Captura una foto del paquete que vas a recoger.'
              : 'Captura una evidencia visual de la entrega.'}
          </Text>
          {fotoUri ? (
            <View>
              <Image source={{ uri: fotoUri }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[styles.photoBox, { flex: 1, height: 50 }]} onPress={tomarFoto}>
                  <Text style={styles.photoText}>Repetir foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBox, { flex: 1, height: 50 }]} onPress={() => setFotoUri(null)}>
                  <Text style={[styles.photoText, { color: '#EF4444' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.photoBox, { flex: 1 }]} onPress={tomarFoto}>
                <Text style={{ fontSize: 30 }}>📷</Text>
                <Text style={styles.photoText}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoBox, { flex: 1 }]} onPress={seleccionarFoto}>
                <Text style={{ fontSize: 30 }}>🖼️</Text>
                <Text style={styles.photoText}>Galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* COBRO — solo si no está pagado y es entrega */}
        {!esRecoleccion && !yaEstaPagado && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Método de Cobro</Text>
            <Text style={styles.label}>MÉTODO DE PAGO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {METODOS_PAGO.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setIdMetodoPago(m.id)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical:   8,
                      borderRadius:      999,
                      backgroundColor:   idMetodoPago === m.id ? '#0F2B46' : '#F1F5F9',
                    }}
                  >
                    <Text style={{ color: idMetodoPago === m.id ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Valor a cobrar: <Text style={{ fontWeight: '700', color: '#D97706' }}>
                ${valorACobrar.toLocaleString('es-CO')} COP
              </Text>
            </Text>
          </View>
        )}

        {/* OBSERVACIONES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder={esRecoleccion ? 'Estado del paquete, condiciones...' : 'Comentarios sobre la entrega...'}
            placeholderTextColor="#94A3B8"
            style={styles.textArea}
            value={observaciones}
            onChangeText={setObservaciones}
          />
        </View>

        {/* RESULTADO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {esRecoleccion ? 'Resultado de Recogida' : 'Resultado de Entrega'}
          </Text>
          {RESULTADOS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={idResultado === r.id ? styles.optionActive : styles.option}
              onPress={() => setIdResultado(r.id)}
            >
              {idResultado === r.id && (
                <Text style={{ marginRight: 8, color: '#0F172A' }}>✓</Text>
              )}
              <Text style={styles.optionText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTON */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            enviando && { opacity: 0.7 },
            (idResultado === 3 || idResultado === 4) && { backgroundColor: '#DC2626' },
          ]}
          onPress={handleConfirmar}
          disabled={enviando}
        >
          {enviando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>
                {idResultado === 3 || idResultado === 4
                  ? (esRecoleccion ? 'Registrar No Recogido' : 'Registrar No Entrega')
                  : (esRecoleccion ? 'Confirmar Recogida' : 'Confirmar Entrega')
                }
              </Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}