import React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './ScreenContainer.styles';

import { ScreenContainerProps } from './ScreenContainer.types';

export default function ScreenContainer({
  children,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
}