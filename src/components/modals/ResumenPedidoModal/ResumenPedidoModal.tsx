// src/components/modals/ResumenPedidoModal/ResumenPedidoModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {
  X,
  User,
  MapPin,
  MessageSquare,
  Phone,
} from 'lucide-react-native';
import styles from './ResumenPedidoModal.styles';
import type { ResumenPedidoModalProps } from './ResumenPedidoModal.types';

export default function ResumenPedidoModal({
  visible,
  pedido,
  onClose,
}: ResumenPedidoModalProps) {

  if (!pedido) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Resumen del Pedido</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* INFO SUPERIOR */}
            <View style={styles.topInfoContainer}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>NUMERO DE GUIA</Text>
                <Text style={styles.infoValue}>{pedido.id}</Text>
              </View>
              <View style={[styles.infoBlock, styles.infoRight]}>
                <Text style={styles.infoLabel}>ESTADO</Text>
                <Text style={styles.infoDate}>{pedido.estado ?? 'N/A'}</Text>
              </View>
            </View>

            {/* DESTINATARIO */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <User size={18} color="#A54B00" />
                </View>
                <Text style={styles.cardTitle}>Destinatario</Text>
              </View>
              <Text style={styles.mainText}>{pedido.destinatario}</Text>
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => Linking.openURL(`tel:${pedido.telefono}`)}
              >
                <Phone size={16} color="#15803D" />
                <Text style={styles.phoneText}>{pedido.telefono}</Text>
              </TouchableOpacity>
            </View>

            {/* DIRECCION */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <MapPin size={18} color="#A54B00" />
                </View>
                <Text style={styles.cardTitle}>Direccion de Entrega</Text>
              </View>
              <Text style={styles.addressText}>{pedido.destino}</Text>
            </View>

            {/* OBSERVACIONES */}
            {pedido.observaciones && (
              <View style={styles.sectionContainer}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <MessageSquare size={18} color="#A54B00" />
                  </View>
                  <Text style={styles.cardTitle}>Observaciones</Text>
                </View>
                <View style={styles.observationBox}>
                  <Text style={styles.observationText}>{pedido.observaciones}</Text>
                </View>
              </View>
            )}

          </ScrollView>

          {/* BOTON — solo cerrar */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalText}>Aceptar y Cerrar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}