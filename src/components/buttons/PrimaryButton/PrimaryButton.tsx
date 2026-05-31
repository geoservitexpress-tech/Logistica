import React from 'react';

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

import { COLORS } from '@/theme';

import { styles } from './PrimaryButton.styles';

import { PrimaryButtonProps } from './PrimaryButton.types';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,

        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={COLORS.white}
        />
      ) : (
        <Text style={styles.text}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}