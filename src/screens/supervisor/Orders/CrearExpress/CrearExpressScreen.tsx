// src/screens/supervisor/Orders/CrearExpress/CrearExpressScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Modal as RNModal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '@/theme';
import { apiClient, ENDPOINTS } from '@/api';
import type { OrdersStackParamList } from '@/navigation/SupervisorNavigator';

type Props = NativeStackScreenProps<OrdersStackParamList, 'CrearExpress'>;

interface CatalogoItem {
  id:     string;
  nombre: string;
}

interface FormState {
  // Remitente
  empresaRemitente:    string;
  telefonoRemitente:   string;
  // Repartidor
  idRepartidor:        string;
  nombreRepartidor:    string;
  // Destinatario
  recipientName:       string;
  recipientPhone:      string;
  // Dirección
  addressType:         string;
  addressName:         string;
  addressNum1:         string;
  addressNum2:         string;
  idPais:              string;
  nombrePais:          string;
  idDepartamento:      string;
  nombreDepartamento:  string;
  idCiudad:            string;
  nombreCiudad:        string;
  // Paquete
  pesoKg:              string;
  valorDeclarado:      string;
  // Precio
  precioTotal:         string;
}

const FORM_INICIAL: FormState = {
  empresaRemitente:    '',
  telefonoRemitente:   '',
  idRepartidor:        '',
  nombreRepartidor:    '',
  recipientName:       '',
  recipientPhone:      '',
  addressType:         'Calle',
  addressName:         '',
  addressNum1:         '',
  addressNum2:         '',
  idPais:              '',
  nombrePais:          '',
  idDepartamento:      '',
  nombreDepartamento:  '',
  idCiudad:            '',
  nombreCiudad:        '',
  pesoKg:              '',
  valorDeclarado:      '',
  precioTotal:         '',
};

const TIPOS_VIA = ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal'];

// =============== HELPERS UI ===============
const Label = ({ label, required }: { label: string; required?: boolean }) => (
  <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, marginTop: 12 }}>
    {label}{required && <Text style={{ color: '#DC2626' }}> *</Text>}
  </Text>
);

const Input = ({ value, onChangeText, placeholder, keyboardType }: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'phone-pad';
}) => (
  <TextInput
    style={{
      backgroundColor: '#fff',
      borderWidth:     1,
      borderColor:     COLORS.border,
      borderRadius:    10,
      paddingHorizontal: 12,
      paddingVertical:   10,
      fontSize:        14,
      color:           COLORS.textPrimary,
    }}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textMuted}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType ?? 'default'}
  />
);

const Dropdown = ({ value, onPress, placeholder }: { value: string; onPress: () => void; placeholder?: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#fff',
      borderWidth:     1,
      borderColor:     COLORS.border,
      borderRadius:    10,
      paddingHorizontal: 12,
      paddingVertical:   10,
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'space-between',
    }}
  >
    <Text style={{ fontSize: 14, color: value ? COLORS.textPrimary : COLORS.textMuted }}>
      {value || placeholder || 'Seleccionar...'}
    </Text>
    <Text style={{ color: COLORS.textMuted }}>▼</Text>
  </TouchableOpacity>
);

const Menu = ({ visible, title, items, onSelect, onClose }: {
  visible: boolean;
  title: string;
  items: { id: string; nombre: string }[];
  onSelect: (item: { id: string; nombre: string }) => void;
  onClose: () => void;
}) => (
  <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: 400 }}>
        <Text style={{
          fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
          padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
        }}>
          {title}
        </Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { onSelect(item); onClose(); }}
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
              <Text style={{ fontSize: 14, color: COLORS.textPrimary }}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </RNModal>
);

// =============== PANTALLA ===============
export default function CrearExpressScreen({ navigation }: Props) {
  const [form,        setForm]        = useState<FormState>(FORM_INICIAL);
  const [enviando,    setEnviando]    = useState<boolean>(false);
  const [cargandoCat, setCargandoCat] = useState<boolean>(true);

  const [repartidores,  setRepartidores]  = useState<CatalogoItem[]>([]);
  const [paises,        setPaises]        = useState<CatalogoItem[]>([]);
  const [departamentos, setDepartamentos] = useState<CatalogoItem[]>([]);
  const [ciudades,      setCiudades]      = useState<CatalogoItem[]>([]);

  const [showRepartidorMenu, setShowRepartidorMenu] = useState<boolean>(false);
  const [showViaMenu,        setShowViaMenu]        = useState<boolean>(false);
  const [showPaisMenu,       setShowPaisMenu]       = useState<boolean>(false);
  const [showDeptoMenu,      setShowDeptoMenu]      = useState<boolean>(false);
  const [showCiudadMenu,     setShowCiudadMenu]     = useState<boolean>(false);

  useEffect(() => {
    async function cargar() {
      try {
        const [rPaises, rDeptos, rCiudades, rRepartidores] = await Promise.all([
          apiClient.get(ENDPOINTS.CATALOGO.PAISES),
          apiClient.get(ENDPOINTS.CATALOGO.DEPARTAMENTOS),
          apiClient.get(ENDPOINTS.CATALOGO.CIUDADES),
          apiClient.get('/supervisor/repartidores').catch(() => ({ data: [] })),
        ]);
        setPaises(rPaises.data.map((p: Record<string, string>) => ({ id: String(p.idPais), nombre: p.nombre })));
        setDepartamentos(rDeptos.data.map((d: Record<string, string>) => ({ id: String(d.idDepartamento), nombre: d.nombre })));
        setCiudades(rCiudades.data.map((c: Record<string, string>) => ({ id: String(c.idCiudad), nombre: c.nombre })));

        const repList = Array.isArray(rRepartidores.data)
          ? rRepartidores.data
          : Array.isArray(rRepartidores.data?.items)
            ? rRepartidores.data.items
            : [];
        setRepartidores(repList.map((r: Record<string, unknown>) => ({
          id:     String(r.idUsuario),
          nombre: `${r.nombres} ${r.apellidos}`,
        })));
      } catch (e) {
        console.log('Error catálogos express:', e);
        Alert.alert('Error', 'No se pudieron cargar los catálogos');
      } finally {
        setCargandoCat(false);
      }
    }
    cargar();
  }, []);

  const handleCrear = async (): Promise<void> => {
    if (!form.empresaRemitente) {
      Alert.alert('Falta', 'Ingresa el nombre del remitente');
      return;
    }
    if (!form.idRepartidor) {
      Alert.alert('Falta', 'Selecciona un repartidor');
      return;
    }
    if (!form.recipientName || !form.recipientPhone) {
      Alert.alert('Falta', 'Completa nombre y teléfono del destinatario');
      return;
    }
    if (!form.idPais || !form.idDepartamento || !form.idCiudad) {
      Alert.alert('Falta', 'Selecciona país, departamento y ciudad');
      return;
    }
    if (!form.addressName || !form.addressNum1 || !form.addressNum2) {
      Alert.alert('Falta', 'Completa la dirección');
      return;
    }
    if (!form.precioTotal) {
      Alert.alert('Falta', 'Ingresa el precio total del servicio express');
      return;
    }

    setEnviando(true);
    try {
      // Para Express: fecha de entrega es HOY mismo (mismo día)
      const hoy = new Date().toISOString().slice(0, 10);

      const body = {
        idTipoPedido:            2, // EXPRESS
        fechaEntrega:            hoy,
        idMetodoRecepcion:       2,
        idUsuarioRepartidor:     parseInt(form.idRepartidor),
        nombreDestinatario:      form.recipientName,
        telefonoDestinatario:    form.recipientPhone,
        tipoViaNombre:           form.addressType,
        nombreVia:               form.addressName,
        numeroPlaca:             form.addressNum1,
        numeroSecundario:        form.addressNum2,
        idCiudad:                parseInt(form.idCiudad),
        idDepartamento:          parseInt(form.idDepartamento),
        idPais:                  parseInt(form.idPais),
        pesoKg:                  parseFloat(form.pesoKg) || 0,
        valorDeclarado:          parseFloat(form.valorDeclarado) || 0,
        fragil:                  false,
        precio:                  parseFloat(form.precioTotal),
        pagadoPorRemitente:      true,
        idMetodoPago:            2, // Transferencia por defecto
        observacionesManifiesto: `EXPRESS · Remitente: ${form.empresaRemitente}${form.telefonoRemitente ? ` (Tel: ${form.telefonoRemitente})` : ''}`,
      };

      await apiClient.post(ENDPOINTS.PEDIDOS.CREATE, body);
      Alert.alert('✅ Listo', 'Servicio express creado y asignado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: unknown } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoCat) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: COLORS.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>
          ⚡ Crear Servicio Express
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        {/* Badge EXPRESS */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderWidth:     1,
          borderColor:     '#FCD34D',
          borderRadius:    10,
          padding:         12,
          marginBottom:    16,
          flexDirection:   'row',
          alignItems:      'center',
          gap:             10,
        }}>
          <Text style={{ fontSize: 22 }}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E' }}>
              Servicio Express
            </Text>
            <Text style={{ fontSize: 11, color: '#A16207', marginTop: 2 }}>
              Se entrega HOY mismo · Asignación inmediata al repartidor
            </Text>
          </View>
        </View>

        {/* REMITENTE */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>📤 Remitente (quien envía)</Text>
          <Label label="Nombre o empresa" required />
          <Input value={form.empresaRemitente} onChangeText={(v) => setForm((p) => ({ ...p, empresaRemitente: v }))} placeholder="Ej. Tienda XYZ" />
          <Label label="Teléfono" />
          <Input value={form.telefonoRemitente} onChangeText={(v) => setForm((p) => ({ ...p, telefonoRemitente: v }))} placeholder="3001234567" keyboardType="phone-pad" />
        </View>

        {/* REPARTIDOR */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>🚴 Asignar repartidor</Text>
          <Label label="Repartidor que entregará hoy" required />
          <Dropdown
            value={form.nombreRepartidor}
            onPress={() => setShowRepartidorMenu(true)}
            placeholder="Seleccionar repartidor..."
          />
          {repartidores.length === 0 && (
            <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>
              ⚠️ No hay repartidores disponibles. Verifica que el endpoint /supervisor/repartidores esté activo.
            </Text>
          )}
        </View>

        {/* DESTINATARIO */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>📬 Destinatario (quien recibe)</Text>
          <Label label="Nombre" required />
          <Input value={form.recipientName} onChangeText={(v) => setForm((p) => ({ ...p, recipientName: v }))} placeholder="Ej. Ana Pérez" />
          <Label label="Teléfono" required />
          <Input value={form.recipientPhone} onChangeText={(v) => setForm((p) => ({ ...p, recipientPhone: v }))} placeholder="3001234567" keyboardType="phone-pad" />
        </View>

        {/* DIRECCIÓN */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>📍 Dirección de entrega</Text>
          <Label label="País" required />
          <Dropdown value={form.nombrePais} onPress={() => setShowPaisMenu(true)} />
          {form.idPais !== '' && (
            <>
              <Label label="Departamento" required />
              <Dropdown value={form.nombreDepartamento} onPress={() => setShowDeptoMenu(true)} />
            </>
          )}
          {form.idDepartamento !== '' && (
            <>
              <Label label="Ciudad" required />
              <Dropdown value={form.nombreCiudad} onPress={() => setShowCiudadMenu(true)} />
            </>
          )}

          <Label label="Tipo de vía" required />
          <Dropdown value={form.addressType} onPress={() => setShowViaMenu(true)} />

          <Label label="Número de vía" required />
          <Input value={form.addressName} onChangeText={(v) => setForm((p) => ({ ...p, addressName: v }))} placeholder="38B" />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Label label="#" required />
              <Input value={form.addressNum1} onChangeText={(v) => setForm((p) => ({ ...p, addressNum1: v }))} placeholder="14" />
            </View>
            <View style={{ flex: 1 }}>
              <Label label="-" required />
              <Input value={form.addressNum2} onChangeText={(v) => setForm((p) => ({ ...p, addressNum2: v }))} placeholder="22" />
            </View>
          </View>
        </View>

        {/* PAQUETE */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>📦 Paquete</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Label label="Peso (KG)" />
              <Input value={form.pesoKg} onChangeText={(v) => setForm((p) => ({ ...p, pesoKg: v }))} placeholder="0.5" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Label label="Valor declarado" />
              <Input value={form.valorDeclarado} onChangeText={(v) => setForm((p) => ({ ...p, valorDeclarado: v }))} placeholder="50000" keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        {/* PRECIO TOTAL */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>💰 Precio del servicio</Text>
          <Label label="Precio total (incluye recargo express)" required />
          <Input
            value={form.precioTotal}
            onChangeText={(v) => setForm((p) => ({ ...p, precioTotal: v }))}
            placeholder="22000"
            keyboardType="decimal-pad"
          />
          <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
            Tarifa normal Bogotá $12.000 + recargo express
          </Text>
        </View>

        {/* BOTÓN CREAR */}
        <TouchableOpacity
          onPress={handleCrear}
          disabled={enviando}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 14,
            borderRadius:    12,
            alignItems:      'center',
            marginTop:       12,
            opacity:         enviando ? 0.7 : 1,
          }}
        >
          {enviando
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>⚡ Crear y asignar Express</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MENÚS */}
      <Menu
        visible={showRepartidorMenu}
        title="Seleccionar repartidor"
        items={repartidores}
        onSelect={(i) => setForm((p) => ({ ...p, idRepartidor: i.id, nombreRepartidor: i.nombre }))}
        onClose={() => setShowRepartidorMenu(false)}
      />
      <Menu visible={showPaisMenu}    title="País"         items={paises}        onSelect={(i) => setForm((p) => ({ ...p, idPais: i.id, nombrePais: i.nombre, idDepartamento: '', nombreDepartamento: '', idCiudad: '', nombreCiudad: '' }))} onClose={() => setShowPaisMenu(false)} />
      <Menu visible={showDeptoMenu}   title="Departamento" items={departamentos} onSelect={(i) => setForm((p) => ({ ...p, idDepartamento: i.id, nombreDepartamento: i.nombre, idCiudad: '', nombreCiudad: '' }))} onClose={() => setShowDeptoMenu(false)} />
      <Menu visible={showCiudadMenu}  title="Ciudad"       items={ciudades}      onSelect={(i) => setForm((p) => ({ ...p, idCiudad: i.id, nombreCiudad: i.nombre }))} onClose={() => setShowCiudadMenu(false)} />
      <Menu
        visible={showViaMenu}
        title="Tipo de vía"
        items={TIPOS_VIA.map((v) => ({ id: v, nombre: v }))}
        onSelect={(i) => setForm((p) => ({ ...p, addressType: i.nombre }))}
        onClose={() => setShowViaMenu(false)}
      />

    </KeyboardAvoidingView>
  );
}