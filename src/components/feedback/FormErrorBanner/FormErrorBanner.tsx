import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '@/theme';
import type { FieldErrors } from '@/utils/validators';
import { countFieldErrors } from '@/utils/helpers';

import { styles } from './FormErrorBanner.styles';

interface FormErrorBannerProps {
  errors: FieldErrors;
}

export default function FormErrorBanner({ errors }: FormErrorBannerProps) {
  const count = countFieldErrors(errors);
  if (count === 0) {
    return null;
  }

  const messages = Object.values(errors);

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>
        {count === 1
          ? 'Falta 1 campo por completar'
          : `Faltan ${count} campos por completar`}
      </Text>
      <Text style={styles.subtitle}>Revisa los campos marcados en rojo</Text>
      {messages.slice(0, 4).map((message) => (
        <Text key={message} style={styles.item}>
          • {message}
        </Text>
      ))}
      {messages.length > 4 && (
        <Text style={styles.more}>
          y {messages.length - 4} más...
        </Text>
      )}
    </View>
  );
}

export function FieldErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <Text style={{ marginTop: 4, fontSize: 12, color: COLORS.error }}>
      {message}
    </Text>
  );
}
