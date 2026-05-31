import { StyleSheet } from 'react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },

  title: {
    color: COLORS.textPrimary,

    ...TYPOGRAPHY.h2,
  },

  subtitle: {
    marginTop: SPACING.xs,

    color: COLORS.textSecondary,

    ...TYPOGRAPHY.body,
  },
});