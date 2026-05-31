import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import { styles } from './AppHeader.styles';

import { AppHeaderProps } from './AppHeader.types';

export default function AppHeader({
  title,
  subtitle,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}