import { StyleSheet } from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '@/theme';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,

    borderRadius: RADIUS.md,

    paddingVertical: SPACING.lg,

    alignItems: 'center',

    justifyContent: 'center',

    ...SHADOWS.button,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: COLORS.white,

    ...TYPOGRAPHY.button,
  },
});