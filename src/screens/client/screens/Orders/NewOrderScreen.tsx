// src/screens/client/screens/Orders/NewOrderScreen.tsx

import React, { useState, useEffect } from 'react';
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

import { COLORS } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import styles from './NewOrderScreen.styles';
import DeliveryMethodModal from '@/components/modals/DeliveryMethodModal';
import GuiaModal from '@/components/modals/GuiaModal';
import type { Order } from '@/types/pedido.types';
import type { PedidosStackParamList } from '@/navigation/navigation.types';
import { apiClient, ENDPOINTS } from '@/api';

type Props = NativeStackScreenProps<PedidosStackParamList, 'NuevoPedido'>;

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
}

interface SectionCardProps {
  icon:     string;
  title:    string;
  children: React.ReactNode;
}

interface InputLabelProps {
  label:     string;
  required?: boolean;
}

interface StyledInputProps {
  placeholder?: string;
  value:        string;
  onChangeText: (val: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad';
  multiline?:   boolean;
  style?:       object;
}

interface DropdownProps {
  value:   string;
  onPress: () => void;
  style?:  object;
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
};

const SectionCard = ({ icon, title, children }: SectionCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}><Text>{icon}</Text></View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InputLabel = ({ label, required }: InputLabelProps) => (
  <Text style={styles.label}>
    {label}{required && <Text style={styles.required}> *</Text>}
  </Text>
);

const StyledInput = ({ placeholder, value, onChangeText, keyboardType, multiline, style }: StyledInputProps) => (
  <TextInput
    style={[styles.input, multiline && styles.inputMultiline, style]}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textMuted}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType ?? 'default'}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
  />
);

const Dropdown = ({ value, onPress, style }: DropdownProps) => (
  <TouchableOpacity style={[styles.dropdown, style]} onPress={onPress}>
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
          fontSize: 14,
          fontWeight: '700',
          color: COLORS.textPrimary,
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
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

  const [form, setForm]         = useState<FormState>(FORM_INICIAL);
  const [fotos, setFotos]       = useState<string[]>([]);
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

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [rPaises, rDeptos, rCiudades] = await Promise.all([
          apiClient.get(ENDPOINTS.CATALOGO.PAISES),
          apiClient.get(ENDPOINTS.CATALOGO.DEPARTAMENTOS),
          apiClient.get(ENDPOINTS.CATALOGO.CIUDADES),
        ]);

        setPaises(rPaises.data.map((p: Record<string, string>) => ({
          id:     String(p.idPais),
          nombre: p.nombre,
        })));

        setDepartamentos(rDeptos.data.map((d: Record<string, string>) => ({
          id:     String(d.idDepartamento),
          nombre: d.nombre,
        })));

        setCiudades(rCiudades.data.map((c: Record<string, string>) => ({
          id:     String(c.idCiudad),
          nombre: c.nombre,
        })));

      } catch (e) {
        console.log('ERROR CATALOGOS:', e);
      }
    }
    cargarCatalogos();
  }, []);

  const update = (field: keyof FormState) => (val: string | boolean) =>
    setForm((p) => ({ ...p, [field]: val }));

  const resetForm = (): void => {
    setForm(FORM_INICIAL);
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
    if (!form.companyName || !form.recipientName) {
      Alert.alert('Campos requeridos', 'Completa empresa y destinatario.');
      return;
    }
    if (!form.recipientPhone) {
      Alert.alert('Campos requeridos', 'Ingresa el telefono del destinatario.');
      return;
    }
    if (!form.idPais || !form.idDepartamento || !form.idCiudad) {
      Alert.alert('Campos requeridos', 'Selecciona Pais, Departamento y Ciudad.');
      return;
    }
    if (!form.addressName || !form.addressNum1 || !form.addressNum2) {
      Alert.alert('Campos requeridos', 'Completa la direccion de entrega.');
      return;
    }
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
      setShowGuiaModal(true);
      resetForm();

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: unknown } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear el pedido';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEnviando(false);
    }
  };

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

        <SectionCard icon="[E]" title="Datos del Cliente">
          <InputLabel label="Nombre de la Empresa" required />
          <StyledInput placeholder="Ej. Global Tech Solutions" value={form.companyName} onChangeText={update('companyName')} />
          <InputLabel label="Identificacion (CC/NIT)" required />
          <View style={styles.row}>
            <Dropdown value={form.idType} onPress={() => setShowIdTypeMenu(true)} style={styles.dropdownSm} />
            <StyledInput placeholder="Numero de documento" value={form.idNumber} onChangeText={update('idNumber')} keyboardType="numeric" style={styles.inputFlex} />
          </View>
        </SectionCard>

        <SectionCard icon="[U]" title="Destinatario">
          <InputLabel label="Nombre del Destinatario" required />
          <StyledInput placeholder="Ej. Juan Perez" value={form.recipientName} onChangeText={update('recipientName')} />
          <InputLabel label="Telefono del Destinatario" required />
          <StyledInput placeholder="Ej. 300 123 4567" value={form.recipientPhone} onChangeText={update('recipientPhone')} keyboardType="phone-pad" />
        </SectionCard>

        <SectionCard icon="[T]" title="Informacion de Envio">
          <InputLabel label="Pais" required />
          <Dropdown value={form.nombrePais} onPress={() => setShowPaisMenu(true)} />

          {form.idPais !== '' && (
            <>
              <InputLabel label="Departamento" required />
              <Dropdown value={form.nombreDepartamento} onPress={() => setShowDeptoMenu(true)} />
            </>
          )}

          {form.idDepartamento !== '' && (
            <>
              <InputLabel label="Ciudad" required />
              <Dropdown value={form.nombreCiudad} onPress={() => setShowCiudadMenu(true)} />
            </>
          )}

          <InputLabel label="Tipo de Via y Direccion" required />
          <View style={styles.row}>
            <Dropdown value={form.addressType} onPress={() => setShowAddressMenu(true)} style={styles.dropdownSm} />
            <StyledInput placeholder="Nombre/No. Via" value={form.addressName} onChangeText={update('addressName')} style={styles.inputFlex} />
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.hashSymbol}>#</Text>
            <StyledInput value={form.addressNum1} onChangeText={update('addressNum1')} keyboardType="numeric" style={styles.inputNum} />
            <Text style={styles.separator}>-</Text>
            <StyledInput value={form.addressNum2} onChangeText={update('addressNum2')} keyboardType="numeric" style={styles.inputNum} />
          </View>

          <InputLabel label="Observaciones de Direccion" />
          <StyledInput placeholder="Apartamento, oficina, instrucciones..." value={form.addressObs} onChangeText={update('addressObs')} multiline />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputLabel label="Tipo de Producto" />
              <Dropdown value={form.productType} onPress={() => setShowProductMenu(true)} />
            </View>
            <View style={[styles.halfCol, { marginLeft: 8 }]}>
              <InputLabel label="Peso (KG)" />
              <View style={styles.weightContainer}>
                <TextInput style={styles.weightInput} value={form.weight} onChangeText={update('weight')} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textMuted} />
                <Text style={styles.weightUnit}>KG</Text>
              </View>
            </View>
          </View>

          <InputLabel label="Valor Declarado" />
          <View style={styles.valueContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput style={styles.valueInput} value={form.declaredValue} onChangeText={update('declaredValue')} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textMuted} />
          </View>
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
          <StyledInput placeholder="Manipular con cuidado, llamar al recibir..." value={form.manifestObs} onChangeText={update('manifestObs')} multiline />

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
          setForm(p => ({
            ...p,
            idPais:             item.id,
            nombrePais:         item.nombre,
            idDepartamento:     '',
            nombreDepartamento: '',
            idCiudad:           '',
            nombreCiudad:       '',
          }));
        }}
        onClose={() => setShowPaisMenu(false)}
      />
      <CatalogoMenu
        visible={showDeptoMenu}
        title="Seleccionar Departamento"
        items={departamentos}
        onSelect={(item) => {
          setForm(p => ({
            ...p,
            idDepartamento:     item.id,
            nombreDepartamento: item.nombre,
            idCiudad:           '',
            nombreCiudad:       '',
          }));
        }}
        onClose={() => setShowDeptoMenu(false)}
      />
      <CatalogoMenu
        visible={showCiudadMenu}
        title="Seleccionar Ciudad"
        items={ciudades}
        onSelect={(item) => {
          setForm(p => ({
            ...p,
            idCiudad:     item.id,
            nombreCiudad: item.nombre,
          }));
        }}
        onClose={() => setShowCiudadMenu(false)}
      />

      <DeliveryMethodModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onPickup={() => {
          setShowDeliveryModal(false);
          navigation.navigate('SolicitarRecogida');
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