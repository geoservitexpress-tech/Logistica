// src/screens/client/screens/Orders/NewOrderScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Modal as RNModal,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import FormErrorBanner, { FieldErrorText } from '@/components/feedback/FormErrorBanner/FormErrorBanner';
import { clearFieldError, getApiErrorMessage } from '@/utils/helpers';
import { validateNewOrder } from '@/utils/validators';
import type { FieldErrors } from '@/utils/validators';
import styles from './NewOrderScreen.styles';
import DeliveryMethodModal from '@/components/modals/DeliveryMethodModal';
import GuiaModal from '@/components/modals/GuiaModal';
import type { Order } from '@/types/pedido.types';
import type { PedidosStackParamList } from '@/navigation/navigation.types';
import { apiClient, ENDPOINTS } from '@/api';

type Props = NativeStackScreenProps<PedidosStackParamList, 'NuevoPedido'>;

type TipoPago = 'pagado' | 'cobrar_entrega';

const METODOS_PAGO_CATALOGO = [
  { id: 1, label: 'Efectivo' },
  { id: 2, label: 'Transferencia' },
  { id: 3, label: 'Bre-B' },
  { id: 4, label: 'Datafono' },
  { id: 5, label: 'Nequi' },
  { id: 6, label: 'Daviplata' },
  { id: 7, label: 'QR / Link de pago' },
];

interface CatalogoItem {
  id:     string;
  nombre: string;
}

interface FormState {
  companyName:        string;
  idType:             string;
  idNumber:           string;
  recipientName:      string;
  recipientPhone:     string;
  addressType:        string;
  addressName:        string;
  addressNum1:        string;
  addressNum2:        string;
  addressObs:         string;
  productType:        string;
  weight:             string;
  declaredValue:      string;
  fragile:            boolean;
  manifestObs:        string;
  metodoPago:         string;
  idPais:             string;
  nombrePais:         string;
  idDepartamento:     string;
  nombreDepartamento: string;
  idCiudad:           string;
  nombreCiudad:       string;
  tipoPago:           TipoPago;
  valorCobrar:        string;
  idMetodoPago:       number;
}

interface SectionCardProps {
  icon:     string;
  title:    string;
  children: React.ReactNode;
}

interface InputLabelProps {
  label:     string;
  required?: boolean;
  error?:    string;
}

interface StyledInputProps {
  placeholder?: string;
  value:        string;
  onChangeText: (val: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad';
  multiline?:   boolean;
  style?:       object;
  error?:       string;
}

interface DropdownProps {
  value:   string;
  onPress: () => void;
  style?:  object;
  error?:  string;
}

interface SimpleMenuProps {
  visible:  boolean;
  options:  string[];
  onSelect: (val: string) => void;
  onClose:  () => void;
}

interface CatalogoMenuProps {
  visible:  boolean;
  title:    string;
  items:    CatalogoItem[];
  onSelect: (item: CatalogoItem) => void;
  onClose:  () => void;
}

const FORM_INICIAL: FormState = {
  companyName:        '',
  idType:             'NIT',
  idNumber:           '',
  recipientName:      '',
  recipientPhone:     '',
  addressType:        'Calle',
  addressName:        '',
  addressNum1:        '',
  addressNum2:        '',
  addressObs:         '',
  productType:        'Electronicos',
  weight:             '',
  declaredValue:      '',
  fragile:            false,
  manifestObs:        '',
  metodoPago:         'Transferencia',
  idPais:             '',
  nombrePais:         '',
  idDepartamento:     '',
  nombreDepartamento: '',
  idCiudad:           '',
  nombreCiudad:       '',
  tipoPago:           'pagado',
  valorCobrar:        '',
  idMetodoPago:       2,
};

const OPCIONES_PAGO: { key: TipoPago; label: string; desc: string; icon: string }[] = [
  { key: 'pagado',         label: 'Ya está pagado',     desc: 'El cliente ya canceló el valor',      icon: '✅' },
  { key: 'cobrar_entrega', label: 'Cobrar al entregar', desc: 'El repartidor cobra al destinatario', icon: '💵' },
];

const SectionCard = ({ icon, title, children }: SectionCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}><Text>{icon}</Text></View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InputLabel = ({ label, required, error }: InputLabelProps) => (
  <Text style={[styles.label, !!error && { color: COLORS.error }]}>
    {label}{required && <Text style={styles.required}> *</Text>}
  </Text>
);

const StyledInput = ({ placeholder, value, onChangeText, keyboardType, multiline, style, error }: StyledInputProps) => (
  <TextInput
    style={[
      styles.input,
      multiline && styles.inputMultiline,
      !!error && styles.inputError,
      style,
    ]}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textMuted}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType ?? 'default'}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
    autoCorrect={false}
    autoCapitalize="none"
  />
);

const Dropdown = ({ value, onPress, style, error }: DropdownProps) => (
  <TouchableOpacity style={[styles.dropdown, !!error && styles.dropdownError, style]} onPress={onPress}>
    <Text style={[styles.dropdownText, !value && { color: COLORS.textMuted }]}>
      {value || 'Seleccionar...'}
    </Text>
    <Text style={styles.dropdownArrow}>v</Text>
  </TouchableOpacity>
);

const SimpleMenu = ({ visible, options, onSelect, onClose }: SimpleMenuProps) => (
  <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.menuOverlay} onPress={onClose} activeOpacity={1}>
      <View style={styles.menuContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={styles.menuItem}
            onPress={() => { onSelect(opt); onClose(); }}
          >
            <Text style={styles.menuItemText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </RNModal>
);

const CatalogoMenu = ({ visible, title, items, onSelect, onClose }: CatalogoMenuProps) => (
  <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: 400 }}>
        <Text style={{
          fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
          padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
        }}>
          {title}
        </Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 320 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={styles.menuItemText}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </RNModal>
);

export default function NewOrderScreen({ navigation }: Props) {
  const { usuario } = useAuth();

  const [form,     setForm]     = useState<FormState>(FORM_INICIAL);
  const [errors,   setErrors]   = useState<FieldErrors>({});
  const [fotos,    setFotos]    = useState<string[]>([]);
  const [enviando, setEnviando] = useState<boolean>(false);

  const [paises,        setPaises]        = useState<CatalogoItem[]>([]);
  const [departamentos, setDepartamentos] = useState<CatalogoItem[]>([]);
  const [ciudades,      setCiudades]      = useState<CatalogoItem[]>([]);

  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [showGuiaModal,     setShowGuiaModal]     = useState<boolean>(false);
  const [pedidoCreado,      setPedidoCreado]      = useState<Order | null>(null);

  const [showIdTypeMenu,  setShowIdTypeMenu]  = useState<boolean>(false);
  const [showAddressMenu, setShowAddressMenu] = useState<boolean>(false);
  const [showProductMenu, setShowProductMenu] = useState<boolean>(false);
  const [showPagoMenu,    setShowPagoMenu]    = useState<boolean>(false);
  const [showPaisMenu,    setShowPaisMenu]    = useState<boolean>(false);
  const [showDeptoMenu,   setShowDeptoMenu]   = useState<boolean>(false);
  const [showCiudadMenu,  setShowCiudadMenu]  = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      setShowDeliveryModal(false);
      setShowGuiaModal(false);
    }, []),
  );

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [rPaises, rDeptos, rCiudades] = await Promise.all([
          apiClient.get(ENDPOINTS.CATALOGO.PAISES),
          apiClient.get(ENDPOINTS.CATALOGO.DEPARTAMENTOS),
          apiClient.get(ENDPOINTS.CATALOGO.CIUDADES),
        ]);
        setPaises(rPaises.data.map((p: Record<string, string>) => ({ id: String(p.idPais), nombre: p.nombre })));
        setDepartamentos(rDeptos.data.map((d: Record<string, string>) => ({ id: String(d.idDepartamento), nombre: d.nombre })));
        setCiudades(rCiudades.data.map((c: Record<string, string>) => ({ id: String(c.idCiudad), nombre: c.nombre })));
      } catch (e) {
        console.log('ERROR CATALOGOS:', e);
      }
    }
    cargarCatalogos();
  }, []);

  const update = (field: keyof FormState) => (val: string | boolean) => {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((prev) => clearFieldError(prev, field));
  };

  const resetForm = (): void => {
    setForm(FORM_INICIAL);
    setErrors({});
    setFotos([]);
  };

  const tomarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a la camara.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setFotos((prev) => [...prev, result.assets[0].uri]);
  };

  const seleccionarFoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a la galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled) setFotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  };

  const eliminarFoto = (index: number): void =>
    setFotos((prev) => prev.filter((_, i) => i !== index));

  const handleCrearPedido = (): void => {
    const nextErrors = validateNewOrder(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setShowDeliveryModal(true);
  };

  const confirmarPedido = async (): Promise<void> => {
    setEnviando(true);
    try {
      const fotosPaqueteBase64: string[] = [];
      for (const uri of fotos) {
        try {
          const response = await fetch(uri);
          const blob     = await response.blob();
          const base64   = await new Promise<string>((resolve, reject) => {
            const reader   = new FileReader();
            reader.onload  = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          fotosPaqueteBase64.push(base64);
        } catch { /* omitir foto */ }
      }

      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      const fechaEntrega = manana.toISOString().slice(0, 10);

      const pagadoPorRemitente = form.tipoPago === 'pagado';
      const precio             = form.tipoPago === 'cobrar_entrega'
        ? parseFloat(form.valorCobrar) || 0
        : 0;

      const body = {
        idTipoPedido:            1,
        fechaEntrega,
        idMetodoRecepcion:       2,
        nombreDestinatario:      form.recipientName,
        telefonoDestinatario:    form.recipientPhone,
        tipoViaNombre:           form.addressType,
        nombreVia:               form.addressName,
        numeroPlaca:             form.addressNum1,
        numeroSecundario:        form.addressNum2,
        idCiudad:                parseInt(form.idCiudad),
        idDepartamento:          parseInt(form.idDepartamento),
        idPais:                  parseInt(form.idPais),
        observacionesDireccion:  form.addressObs || undefined,
        tipoProductoNombre:      form.productType,
        pesoKg:                  parseFloat(form.weight) || 0,
        valorDeclarado:          parseFloat(form.declaredValue) || 0,
        fragil:                  form.fragile,
        observacionesManifiesto: form.manifestObs || undefined,
        pagadoPorRemitente,
        ...(precio > 0 && { precio }),
        ...(pagadoPorRemitente && { idMetodoPago: form.idMetodoPago }),
        ...(fotosPaqueteBase64.length > 0 && { fotosPaqueteBase64 }),
      };

      const { data } = await apiClient.post(ENDPOINTS.PEDIDOS.CREATE, body);

      const nuevo: Order = {
        id:            data.numGuia ?? `GL-${Date.now()}`,
        estado:        'pendiente',
        fecha:         new Date().toLocaleDateString('es-CO'),
        destinatario:  form.recipientName,
        telefono:      form.recipientPhone,
        destino:       form.nombreCiudad,
        origen:        'Bogota, CO',
        pago:          form.metodoPago,
        fotos,
        fragil:        form.fragile,
        manifestObs:   form.manifestObs,
        companyName:   form.companyName,
        weight:        form.weight,
        declaredValue: form.declaredValue,
        metodoEntrega: 'DESPACHO',
      };

      setPedidoCreado(nuevo);
      resetForm();
      setShowGuiaModal(true);

    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'Error al crear el pedido'));
    } finally {
      setEnviando(false);
    }
  };

  const previewDireccion = [
    form.addressType,
    form.addressName,
    form.addressNum1 ? `# ${form.addressNum1}` : '',
    form.addressNum2 ? `- ${form.addressNum2}` : '',
  ].filter(Boolean).join(' ');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.topBarTitle}>Nuevo Pedido</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Nuevo Pedido</Text>
        <Text style={styles.screenSubtitle}>Ingrese los detalles del manifiesto de carga</Text>

        <FormErrorBanner errors={errors} />

        <SectionCard icon="[E]" title="Datos del Cliente">
          <InputLabel label="Nombre de la Empresa" required error={errors.companyName} />
          <StyledInput placeholder="Ej. Global Tech Solutions" value={form.companyName} onChangeText={update('companyName')} error={errors.companyName} />
          <FieldErrorText message={errors.companyName} />
          <InputLabel label="Identificacion (CC/NIT)" required error={errors.idNumber} />
          <View style={styles.row}>
            <Dropdown value={form.idType} onPress={() => setShowIdTypeMenu(true)} style={styles.dropdownSm} />
            <StyledInput placeholder="Numero de documento" value={form.idNumber} onChangeText={update('idNumber')} keyboardType="numeric" style={styles.inputFlex} error={errors.idNumber} />
          </View>
          <FieldErrorText message={errors.idNumber} />
        </SectionCard>

        <SectionCard icon="[U]" title="Destinatario">
          <InputLabel label="Nombre del Destinatario" required error={errors.recipientName} />
          <StyledInput placeholder="Ej. Juan Perez" value={form.recipientName} onChangeText={update('recipientName')} error={errors.recipientName} />
          <FieldErrorText message={errors.recipientName} />
          <InputLabel label="Telefono del Destinatario" required error={errors.recipientPhone} />
          <StyledInput placeholder="Ej. 300 123 4567" value={form.recipientPhone} onChangeText={update('recipientPhone')} keyboardType="phone-pad" error={errors.recipientPhone} />
          <FieldErrorText message={errors.recipientPhone} />
        </SectionCard>

        <SectionCard icon="[T]" title="Informacion de Envio">
          <InputLabel label="Pais" required error={errors.idPais} />
          <Dropdown value={form.nombrePais} onPress={() => setShowPaisMenu(true)} error={errors.idPais} />
          <FieldErrorText message={errors.idPais} />

          {form.idPais !== '' && (
            <>
              <InputLabel label="Departamento" required error={errors.idDepartamento} />
              <Dropdown value={form.nombreDepartamento} onPress={() => setShowDeptoMenu(true)} error={errors.idDepartamento} />
              <FieldErrorText message={errors.idDepartamento} />
            </>
          )}

          {form.idDepartamento !== '' && (
            <>
              <InputLabel label="Ciudad" required error={errors.idCiudad} />
              <Dropdown value={form.nombreCiudad} onPress={() => setShowCiudadMenu(true)} error={errors.idCiudad} />
              <FieldErrorText message={errors.idCiudad} />
            </>
          )}

          <InputLabel label="Dirección de Entrega" required error={errors.addressName || errors.addressNum1 || errors.addressNum2} />

          {previewDireccion.length > 2 && (
            <View style={{
              backgroundColor: '#F0F9FF',
              borderRadius:    8,
              padding:         10,
              marginBottom:    8,
              borderWidth:     1,
              borderColor:     '#BAE6FD',
            }}>
              <Text style={{ fontSize: 11, color: '#0369A1', fontWeight: '700' }}>DIRECCIÓN GENERADA:</Text>
              <Text style={{ fontSize: 13, color: '#0F2B46', fontWeight: '600', marginTop: 2 }}>
                {previewDireccion}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Dropdown value={form.addressType} onPress={() => setShowAddressMenu(true)} style={styles.dropdownSm} />
            <StyledInput placeholder="38B" value={form.addressName} onChangeText={update('addressName')} style={styles.inputFlex} error={errors.addressName} />
          </View>
          <FieldErrorText message={errors.addressName} />
          <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, marginTop: 4 }}>
            ↑ Número de vía antes del # (ej: 38B, 143, 7A)
          </Text>

          <View style={[styles.row, { marginTop: 4 }]}>
            <Text style={styles.hashSymbol}>#</Text>
            <StyledInput placeholder="1" value={form.addressNum1} onChangeText={update('addressNum1')} keyboardType="numeric" style={styles.inputNum} error={errors.addressNum1} />
            <Text style={styles.separator}>-</Text>
            <StyledInput placeholder="14" value={form.addressNum2} onChangeText={update('addressNum2')} keyboardType="numeric" style={styles.inputNum} error={errors.addressNum2} />
          </View>
          <FieldErrorText message={errors.addressNum1 || errors.addressNum2} />

          <InputLabel label="Observaciones de Direccion" />
          <StyledInput placeholder="Apartamento, piso, casa, instrucciones..." value={form.addressObs} onChangeText={update('addressObs')} multiline />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputLabel label="Tipo de Producto" />
              <Dropdown value={form.productType} onPress={() => setShowProductMenu(true)} />
            </View>
            <View style={[styles.halfCol, { marginLeft: 8 }]}>
              <InputLabel label="Peso (KG)" />
              <View style={styles.weightContainer}>
                <TextInput
                  style={styles.weightInput}
                  value={form.weight}
                  onChangeText={update('weight')}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.weightUnit}>KG</Text>
              </View>
            </View>
          </View>

          <InputLabel label="Valor Declarado" />
          <View style={styles.valueContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.valueInput}
              value={form.declaredValue}
              onChangeText={update('declaredValue')}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </SectionCard>

        <SectionCard icon="💳" title="Estado del Pago">
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 }}>
            ¿El producto ya está pagado o hay que cobrar al entregar?
          </Text>

          {OPCIONES_PAGO.map((op) => (
            <TouchableOpacity
              key={op.key}
              onPress={() => setForm((p) => ({ ...p, tipoPago: op.key, valorCobrar: '', idMetodoPago: 2 }))}
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                padding:         14,
                borderRadius:    12,
                borderWidth:     2,
                borderColor:     form.tipoPago === op.key ? COLORS.primary : COLORS.border,
                backgroundColor: form.tipoPago === op.key ? '#FFF7F0' : COLORS.white,
                marginBottom:    10,
                gap:             12,
              }}
            >
              <Text style={{ fontSize: 24 }}>{op.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: form.tipoPago === op.key ? COLORS.primary : COLORS.textPrimary }}>
                  {op.label}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                  {op.desc}
                </Text>
              </View>
              <View style={{
                width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: form.tipoPago === op.key ? COLORS.primary : COLORS.border,
                backgroundColor: form.tipoPago === op.key ? COLORS.primary : 'transparent',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {form.tipoPago === op.key && (
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {form.tipoPago === 'pagado' && (
            <View style={{ marginTop: 4 }}>
              <InputLabel label="¿Cómo fue pagado?" required />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {METODOS_PAGO_CATALOGO.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setForm(p => ({ ...p, idMetodoPago: m.id }))}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                        backgroundColor: form.idMetodoPago === m.id ? COLORS.primary : '#F1F5F9',
                      }}
                    >
                      <Text style={{ color: form.idMetodoPago === m.id ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {form.tipoPago === 'cobrar_entrega' && (
            <View style={{ marginTop: 4 }}>
              <InputLabel label="Valor a cobrar al entregar" required error={errors.valorCobrar} />
              <View style={[styles.valueContainer, !!errors.valorCobrar && styles.inputError]}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.valueInput}
                  value={form.valorCobrar}
                  onChangeText={update('valorCobrar')}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <FieldErrorText message={errors.valorCobrar} />
            </View>
          )}
        </SectionCard>

        <SectionCard icon="[M]" title="Detalles del Manifiesto">
          <InputLabel label="Metodo de Pago" required />
          <Dropdown value={form.metodoPago} onPress={() => setShowPagoMenu(true)} />

          <View style={[styles.fragileRow, { marginTop: 16 }]}>
            <View style={styles.fragileBadge}>
              <Text style={styles.fragileBadgeText}>FRAGIL</Text>
            </View>
            <Switch
              value={form.fragile}
              onValueChange={update('fragile')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <InputLabel label="Observaciones" />
          <StyledInput
            placeholder="Manipular con cuidado, llamar al recibir..."
            value={form.manifestObs}
            onChangeText={update('manifestObs')}
            multiline
          />

          <InputLabel label="Fotos del Paquete (Opcional)" />
          <View style={styles.photoRow}>
            {fotos.map((uri: string, i: number) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoDelete} onPress={() => eliminarFoto(i)}>
                  <Text style={styles.photoDeleteTxt}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.photoButtonAdd} onPress={tomarFoto}>
              <Text style={styles.photoIcon}>[cam]</Text>
              <Text style={[styles.photoLabel, { color: COLORS.primary }]}>Camara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={seleccionarFoto}>
              <Text style={styles.photoIcon}>[img]</Text>
              <Text style={styles.photoLabel}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.createButton, enviando && { opacity: 0.7 }]}
          onPress={handleCrearPedido}
          activeOpacity={0.85}
          disabled={enviando}
        >
          {enviando
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.createButtonText}>+ Crear Pedido</Text>
          }
        </TouchableOpacity>
      </View>

      <SimpleMenu visible={showIdTypeMenu}  options={['CC','NIT','CE','Pasaporte']}                                     onSelect={update('idType')}      onClose={() => setShowIdTypeMenu(false)} />
      <SimpleMenu visible={showAddressMenu} options={['Calle','Carrera','Avenida','Diagonal','Transversal']}            onSelect={update('addressType')} onClose={() => setShowAddressMenu(false)} />
      <SimpleMenu visible={showProductMenu} options={['Electronicos','Ropa','Alimentos','Documentos','Muebles','Otro']} onSelect={update('productType')} onClose={() => setShowProductMenu(false)} />
      <SimpleMenu visible={showPagoMenu}    options={['Transferencia','Efectivo']}                                      onSelect={update('metodoPago')}  onClose={() => setShowPagoMenu(false)} />

      <CatalogoMenu
        visible={showPaisMenu}
        title="Seleccionar Pais"
        items={paises}
        onSelect={(item) => {
          setForm(p => ({ ...p, idPais: item.id, nombrePais: item.nombre, idDepartamento: '', nombreDepartamento: '', idCiudad: '', nombreCiudad: '' }));
          setErrors((prev) => clearFieldError(prev, 'idPais'));
        }}
        onClose={() => setShowPaisMenu(false)}
      />
      <CatalogoMenu
        visible={showDeptoMenu}
        title="Seleccionar Departamento"
        items={departamentos}
        onSelect={(item) => {
          setForm(p => ({ ...p, idDepartamento: item.id, nombreDepartamento: item.nombre, idCiudad: '', nombreCiudad: '' }));
          setErrors((prev) => clearFieldError(prev, 'idDepartamento'));
        }}
        onClose={() => setShowDeptoMenu(false)}
      />
      <CatalogoMenu
        visible={showCiudadMenu}
        title="Seleccionar Ciudad"
        items={ciudades}
        onSelect={(item) => {
          setForm(p => ({ ...p, idCiudad: item.id, nombreCiudad: item.nombre }));
          setErrors((prev) => clearFieldError(prev, 'idCiudad'));
        }}
        onClose={() => setShowCiudadMenu(false)}
      />

      <DeliveryMethodModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onPickup={() => {
          setShowDeliveryModal(false);
          const manana = new Date();
          manana.setDate(manana.getDate() + 1);

          navigation.navigate('SolicitarRecogida', {
            destinoEntrega: {
              nombreDestinatario:      form.recipientName,
              telefonoDestinatario:    form.recipientPhone,
              tipoViaNombre:           form.addressType,
              nombreVia:               form.addressName,
              numeroPlaca:             form.addressNum1,
              numeroSecundario:        form.addressNum2,
              idCiudad:                parseInt(form.idCiudad),
              idDepartamento:          parseInt(form.idDepartamento),
              idPais:                  parseInt(form.idPais),
              observacionesDireccion:  form.addressObs || undefined,
            },
            pedidoBase: {
              idTipoPedido:            1,
              fechaEntrega:            manana.toISOString().slice(0, 10),
              tipoProductoNombre:      form.productType,
              pesoKg:                  parseFloat(form.weight) || 0,
              valorDeclarado:          parseFloat(form.declaredValue) || 0,
              fragil:                  form.fragile,
              observacionesManifiesto: form.manifestObs || undefined,
              pagadoPorRemitente:      form.tipoPago === 'pagado',
              ...(form.tipoPago === 'cobrar_entrega' && { precio: parseFloat(form.valorCobrar) || 0 }),
              ...(form.tipoPago === 'pagado' && { idMetodoPago: form.idMetodoPago }),
            },
          });
          resetForm();
        }}
        onPhysicalPoint={() => {
          setShowDeliveryModal(false);
          confirmarPedido();
        }}
      />

      <GuiaModal
        visible={showGuiaModal}
        pedido={pedidoCreado}
        onCerrar={() => setShowGuiaModal(false)}
        onConfirmar={() => {
          setShowGuiaModal(false);
          navigation.getParent()?.navigate('Historial');
        }}
      />
    </KeyboardAvoidingView>
  );
}