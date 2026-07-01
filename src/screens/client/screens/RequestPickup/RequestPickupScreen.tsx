// src/screens/client/screens/RequestPickup/RequestPickupScreen.tsx

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
  ActivityIndicator,
  FlatList,
  Modal as RNModal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import FormErrorBanner, { FieldErrorText } from '@/components/feedback/FormErrorBanner/FormErrorBanner';
import { clearFieldError, getApiErrorMessage } from '@/utils/helpers';
import { validateRequestPickup } from '@/utils/validators';
import type { FieldErrors } from '@/utils/validators';
import styles from './RequestPickupScreen.styles';
import GuiaModal from '@/components/modals/GuiaModal';
import type { Order } from '@/types/pedido.types';
import type { PedidosStackParamList } from '@/navigation/navigation.types';
import { apiClient, ENDPOINTS } from '@/api';

type Props = NativeStackScreenProps<PedidosStackParamList, 'SolicitarRecogida'>;

interface CatalogoItem {
  id:     string;
  nombre: string;
}

interface FormState {
  companyName:        string;
  phone:              string;
  addressName:        string;
  num1:               string;
  num2:               string;
  addressObs:         string;
  idPais:             string;
  nombrePais:         string;
  idDepartamento:     string;
  nombreDepartamento: string;
  idCiudad:           string;
  nombreCiudad:       string;
  tipoVia:            string;
}

interface InputLabelProps {
  label:     string;
  required?: boolean;
  error?:    string;
}

interface DropdownProps {
  value:   string;
  onPress: () => void;
  error?:  string;
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
  phone:              '',
  addressName:        '',
  num1:               '',
  num2:               '',
  addressObs:         '',
  idPais:             '',
  nombrePais:         '',
  idDepartamento:     '',
  nombreDepartamento: '',
  idCiudad:           '',
  nombreCiudad:       '',
  tipoVia:            'Calle',
};

const InputLabel = ({ label, required = false, error }: InputLabelProps) => (
  <Text style={[styles.label, !!error && { color: COLORS.error }]}>
    {label}{required && <Text style={styles.required}> *</Text>}
  </Text>
);

const Dropdown = ({ value, onPress, error }: DropdownProps) => (
  <TouchableOpacity style={[styles.dropdown, !!error && styles.inputError]} onPress={onPress}>
    <Text style={[styles.dropdownText, !value && { color: COLORS.textMuted }]}>
      {value || 'Seleccionar...'}
    </Text>
    <Text style={styles.dropdownArrow}>v</Text>
  </TouchableOpacity>
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
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={{ fontSize: 15, color: COLORS.textPrimary }}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </RNModal>
);

export default function RequestPickupScreen({ navigation, route }: Props) {
  const { usuario } = useAuth();
  const { destinoEntrega, pedidoBase } = route.params;

  const [form, setForm]         = useState<FormState>(FORM_INICIAL);
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [enviando, setEnviando] = useState<boolean>(false);

  const [paises,        setPaises]        = useState<CatalogoItem[]>([]);
  const [departamentos, setDepartamentos] = useState<CatalogoItem[]>([]);
  const [ciudades,      setCiudades]      = useState<CatalogoItem[]>([]);

  const [showViaMenu,    setShowViaMenu]    = useState<boolean>(false);
  const [showPaisMenu,   setShowPaisMenu]   = useState<boolean>(false);
  const [showDeptoMenu,  setShowDeptoMenu]  = useState<boolean>(false);
  const [showCiudadMenu, setShowCiudadMenu] = useState<boolean>(false);

  const [showGuiaModal, setShowGuiaModal] = useState<boolean>(false);
  const [pedidoCreado,  setPedidoCreado]  = useState<Order | null>(null);

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
        console.log('Error cargando catalogos', e);
      }
    }
    cargarCatalogos();
  }, []);

  const update = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => clearFieldError(prev, field));
  };

  const handleSubmit = async (): Promise<void> => {
    const nextErrors = validateRequestPickup(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setEnviando(true);

    try {
      const body = {
        ...pedidoBase,
        idMetodoRecepcion:       1,
        nombreDestinatario:      form.companyName,
        telefonoDestinatario:    form.phone,
        tipoViaNombre:           form.tipoVia,
        nombreVia:               form.addressName,
        numeroPlaca:             form.num1,
        numeroSecundario:        form.num2,
        idCiudad:                parseInt(form.idCiudad),
        idDepartamento:          parseInt(form.idDepartamento),
        idPais:                  parseInt(form.idPais),
        observacionesDireccion:  form.addressObs || undefined,
        destinoEntrega,
      };

      const { data } = await apiClient.post(ENDPOINTS.PEDIDOS.CREATE, body);

      // Direccion de recogida (origen) en texto
      const direccionRecogida = [
        form.tipoVia,
        form.addressName,
        `# ${form.num1}-${form.num2}`,
        form.addressObs,
      ].filter(Boolean).join(' ');

      const nuevo: Order = {
        id:            data.numGuia ?? `GL-${Date.now()}`,
        estado:        'pendiente',
        fecha:         new Date().toLocaleDateString('es-CO'),
        // El destinatario final viene del destino de entrega
        destinatario:  destinoEntrega.nombreDestinatario,
        telefono:      destinoEntrega.telefonoDestinatario,
        destino:       direccionRecogida,
        origen:        form.nombreCiudad,
        pago:          '',
        fotos:         [],
        fragil:        pedidoBase.fragil,
        manifestObs:   pedidoBase.observacionesManifiesto,
        companyName:   form.companyName,
        weight:        String(pedidoBase.pesoKg ?? 0),
        declaredValue: String(pedidoBase.valorDeclarado ?? 0),
        metodoEntrega: 'RECOGIDA',
      };

      setPedidoCreado(nuevo);
      setShowGuiaModal(true);

    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'Error al solicitar recogida'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text>U</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Solicitar Recogida</Text>
        <Text style={styles.screenSubtitle}>
          Complete los datos de origen para programar la recoleccion de su mercancia.
        </Text>

        <FormErrorBanner errors={errors} />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text>[E]</Text>
            </View>
            <Text style={styles.cardTitle}>Datos de la Empresa</Text>
          </View>

          <InputLabel label="Nombre de la Empresa" required error={errors.companyName} />
          <TextInput
            style={[styles.input, !!errors.companyName && styles.inputError]}
            placeholder="Ej. Logistica Global S.A."
            placeholderTextColor={COLORS.textMuted}
            value={form.companyName}
            onChangeText={update('companyName')}
          />
          <FieldErrorText message={errors.companyName} />

          <InputLabel label="Telefono de Contacto" required error={errors.phone} />
          <TextInput
            style={[styles.input, !!errors.phone && styles.inputError]}
            placeholder="+57 000 000 0000"
            placeholderTextColor={COLORS.textMuted}
            value={form.phone}
            onChangeText={update('phone')}
            keyboardType="phone-pad"
          />
          <FieldErrorText message={errors.phone} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Text>[P]</Text>
            </View>
            <Text style={styles.cardTitle}>Direccion de Recogida</Text>
          </View>

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

          <InputLabel label="Tipo de via" required />
          <Dropdown value={form.tipoVia} onPress={() => setShowViaMenu(true)} />

          <InputLabel label="Nombre de via / Numero" required error={errors.addressName} />
          <TextInput
            style={[styles.input, !!errors.addressName && styles.inputError]}
            placeholder="Ej. Gran Via, 45"
            placeholderTextColor={COLORS.textMuted}
            value={form.addressName}
            onChangeText={update('addressName')}
          />
          <FieldErrorText message={errors.addressName} />

          <View style={styles.rowAddress}>
            <View style={styles.numFieldWrap}>
              <Text style={styles.numLabel}>#</Text>
              <TextInput
                style={[styles.numInput, !!errors.num1 && styles.inputError]}
                value={form.num1}
                onChangeText={update('num1')}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <Text style={styles.dash}>-</Text>
            <TextInput
              style={[styles.numInput, { width: 60 }, !!errors.num2 && styles.inputError]}
              value={form.num2}
              onChangeText={update('num2')}
              keyboardType="numeric"
              placeholder="00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <FieldErrorText message={errors.num1 || errors.num2} />

          <InputLabel label="Observaciones de la Direccion" />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Ej. Entrar por el muelle lateral, preguntar por seguridad."
            placeholderTextColor={COLORS.textMuted}
            value={form.addressObs}
            onChangeText={update('addressObs')}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, enviando && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={enviando}
          >
            {enviando
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.submitButtonText}>Solicitar Recogida</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.expressBanner}>
          <Text style={styles.expressTitle}>Servicio Express</Text>
          <Text style={styles.expressDesc}>
            Las recogidas solicitadas antes de las 14:00h se procesaran el mismo dia.
          </Text>
          <View style={styles.expressBullets}>
            {['Monitoreo en tiempo real', 'Seguro de carga incluido'].map((item: string) => (
              <View key={item} style={styles.bullet}>
                <Text>OK </Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
          setErrors((prev) => clearFieldError(prev, 'idPais'));
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
          setErrors((prev) => clearFieldError(prev, 'idDepartamento'));
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
          setErrors((prev) => clearFieldError(prev, 'idCiudad'));
        }}
        onClose={() => setShowCiudadMenu(false)}
      />
      <CatalogoMenu
        visible={showViaMenu}
        title="Tipo de Via"
        items={[
          { id: 'Calle',       nombre: 'Calle' },
          { id: 'Carrera',     nombre: 'Carrera' },
          { id: 'Avenida',     nombre: 'Avenida' },
          { id: 'Diagonal',    nombre: 'Diagonal' },
          { id: 'Transversal', nombre: 'Transversal' },
        ]}
        onSelect={(item) => {
          setForm(p => ({ ...p, tipoVia: item.nombre }));
        }}
        onClose={() => setShowViaMenu(false)}
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