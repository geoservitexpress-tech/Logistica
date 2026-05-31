import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PackageCheck, X } from 'lucide-react-native';

export default function ConfirmarRecogidaModal({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Confirmar Carga</Text>
          <Text style={styles.desc}>¿Has verificado que todos los paquetes están en el vehículo?</Text>
          
          <View style={styles.infoBox}>
            <PackageCheck color="#E8712A" size={24} />
            <Text style={styles.infoText}>12 Pedidos listos para ruta</Text>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmBtnText}>Iniciar Recorrido</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', color: '#1E293B' },
  desc: { textAlign: 'center', color: '#64748B', marginVertical: 15 },
  infoBox: { backgroundColor: '#FFF7ED', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  infoText: { color: '#9A3412', fontWeight: '700' },
  confirmBtn: { backgroundColor: '#1E293B', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '700' },
  cancelBtn: { marginTop: 10, height: 50, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#94A3B8', fontWeight: '600' }
});