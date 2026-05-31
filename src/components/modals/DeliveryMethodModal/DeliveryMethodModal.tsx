import React from 'react';

import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './DeliveryMethodModal.styles';

import {
  DeliveryMethodModalProps,
} from './DeliveryMethodModal.types';

export default function DeliveryMethodModal({
  visible,
  onClose,
  onPickup,
  onPhysicalPoint,
}: DeliveryMethodModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>
              🚛
            </Text>
          </View>

          <Text style={styles.title}>
            ¿Cómo deseas entregar el
            pedido?
          </Text>

          <Text style={styles.subtitle}>
            Selecciona el método de
            entrega que mejor se adapte
            a tu logística actual.
          </Text>

          <TouchableOpacity
            style={styles.option}
            onPress={onPickup}
            activeOpacity={0.85}
          >
            <View style={styles.optionIcon}>
              <Text
                style={styles.optionEmoji}
              >
                🏃
              </Text>
            </View>

            <View style={styles.optionText}>
              <Text
                style={styles.optionTitle}
              >
                Solicitar Recogida
              </Text>

              <Text
                style={styles.optionDesc}
              >
                Un transportador pasará
                a tu dirección
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={onPhysicalPoint}
            activeOpacity={0.85}
          >
            <View style={styles.optionIcon}>
              <Text
                style={styles.optionEmoji}
              >
                📍
              </Text>
            </View>

            <View style={styles.optionText}>
              <Text
                style={styles.optionTitle}
              >
                Entregar en Punto Físico
              </Text>

              <Text
                style={styles.optionDesc}
              >
                Lleva el paquete al punto
                más cercano
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
