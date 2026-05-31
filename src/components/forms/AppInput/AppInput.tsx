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
  error,
  ...rest
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <TextInput
        placeholderTextColor="#94A3B8"
        style={styles.input}
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