import React from 'react';

import {
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from './AppInput.styles';

import { AppInputProps } from './AppInput.types';

export default function AppInput({
  label,
  required,
  error,
  style,
  ...rest
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TextInput
        placeholderTextColor="#94A3B8"
        style={[styles.input, !!error && styles.inputError, style]}
        {...rest}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}