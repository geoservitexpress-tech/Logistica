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

const RESULTADOS = [
  { id: 1, label: 'Exitoso' },
  { id: 2, label: 'Exitoso con comentarios' },
  { id: 3, label: 'No entregado' },
  { id: 4, label: 'Rechazado por el destinatario' },
];

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
  const { id, direccion, destinatario, telefono } = route.params;
  const { pedidos, completarPedido } = useRuta();

  const [valorRecaudado,     setValorRecaudado]     = useState<string>('');
  const [observaciones,      setObservaciones]      = useState<string>('');
  const [idResultado,        setIdResultado]        = useState<number>(1);
  const [idMetodoPago,       setIdMetodoPago]       = useState<number>(1);
  const [pagadoPorRemitente, setPagadoPorRemitente] = useState<boolean>(false);
  const [fotoUri,            setFotoUri]            = useState<string | null>(null);
  const [enviando,           setEnviando]           = useState<boolean>(false);

  // Buscar el estado actual del pedido en el context
  const pedidoActual = pedidos.find((p) => p.id === id);

  const tomarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la camara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const seleccionarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const handleConfirmar = async (): Promise<void> => {
  if (!fotoUri) {
    Alert.alert('Foto requerida', 'Debes tomar una foto como evidencia de la entrega.');
    return;
  }

  setEnviando(true);

  try {
    // Intentar aceptar — ignorar 409 si ya está en curso
    try {
      await apiClient.post(`/repartidor/pedidos/${id}/aceptar`);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status !== 409) throw e;
      // 409 = ya está en curso, continuamos
    }

    // Convertir foto a base64
    const response = await fetch(fotoUri);
    const blob     = await response.blob();
    const base64   = await new Promise<string>((resolve, reject) => {
      const reader   = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const body = {
      idResultadoEntrega:  idResultado,
      pagadoPorRemitente,
      idMetodoPago,
      valorRecaudado:      parseFloat(valorRecaudado) || 0,
      observaciones:       observaciones || undefined,
      fotosEntregaBase64:  [base64],
    };

    await apiClient.post(`/repartidor/pedidos/${id}/confirmar-entrega`, body);

    completarPedido(id);

    Alert.alert(
      'Entrega confirmada',
      `La entrega #${id} fue registrada correctamente.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );

  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: unknown } }; message?: string };
    const msg = err?.response?.data?.message ?? err?.message ?? 'Error al confirmar entrega';
    Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
  } finally {
    setEnviando(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: '#0F172A' }}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Entrega</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* INFO */}
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ORDEN #{id}</Text>
          </View>
          <Text style={styles.title}>Confirmar Entrega</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>DESTINATARIO</Text>
          <Text style={styles.value}>{destinatario ?? 'N/A'}</Text>
          <Text style={styles.label}>DIRECCION</Text>
          <Text style={styles.value}>{direccion ?? 'N/A'}</Text>
          {telefono && (
            <>
              <Text style={styles.label}>TELEFONO</Text>
              <Text style={styles.value}>{telefono}</Text>
            </>
          )}
        </View>

        {/* FOTO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Foto de Entrega *</Text>
          <Text style={styles.sectionDescription}>
            Captura una evidencia visual de la entrega.
          </Text>
          {fotoUri ? (
            <View>
              <Image
                source={{ uri: fotoUri }}
                style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.photoBox, { flex: 1, height: 50 }]}
                  onPress={tomarFoto}
                >
                  <Text style={styles.photoText}>Repetir foto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoBox, { flex: 1, height: 50 }]}
                  onPress={() => setFotoUri(null)}
                >
                  <Text style={[styles.photoText, { color: '#EF4444' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.photoBox, { flex: 1 }]} onPress={tomarFoto}>
                <Text style={{ fontSize: 30 }}>{'[CAM]'}</Text>
                <Text style={styles.photoText}>Camara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoBox, { flex: 1 }]} onPress={seleccionarFoto}>
                <Text style={{ fontSize: 30 }}>{'[IMG]'}</Text>
                <Text style={styles.photoText}>Galeria</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* COBRO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gestion de Cobro</Text>

          <Text style={styles.label}>METODO DE PAGO</Text>
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
                  <Text style={{
                    color:      idMetodoPago === m.id ? '#fff' : '#64748B',
                    fontWeight: '600',
                    fontSize:   13,
                  }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>VALOR RECAUDADO</Text>
          <TextInput
            placeholder="$ 0"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={valorRecaudado}
            onChangeText={setValorRecaudado}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            onPress={() => setPagadoPorRemitente(!pagadoPorRemitente)}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}
          >
            <View style={{
              width:           22,
              height:          22,
              borderRadius:    4,
              borderWidth:     2,
              borderColor:     '#0F2B46',
              backgroundColor: pagadoPorRemitente ? '#0F2B46' : 'transparent',
              justifyContent:  'center',
              alignItems:      'center',
            }}>
              {pagadoPorRemitente && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
            </View>
            <Text style={{ color: '#0F172A', fontSize: 14 }}>Pagado por remitente</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 12 }]}>OBSERVACIONES</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Agregar comentarios..."
            placeholderTextColor="#94A3B8"
            style={styles.textArea}
            value={observaciones}
            onChangeText={setObservaciones}
          />
        </View>

        {/* RESULTADO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resultado de Entrega</Text>
          {RESULTADOS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={idResultado === r.id ? styles.optionActive : styles.option}
              onPress={() => setIdResultado(r.id)}
            >
              {idResultado === r.id && (
                <Text style={{ marginRight: 8, color: '#0F172A' }}>{'[OK]'}</Text>
              )}
              <Text style={styles.optionText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTON */}
        <TouchableOpacity
          style={[styles.confirmBtn, enviando && { opacity: 0.7 }]}
          onPress={handleConfirmar}
          disabled={enviando}
        >
          {enviando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Confirmar Entrega</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}