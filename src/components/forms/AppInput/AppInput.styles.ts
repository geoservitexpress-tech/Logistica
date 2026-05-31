import { StyleSheet } from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  label: {
    marginBottom: SPACING.xs,

    color: COLORS.textSecondary,

    ...TYPOGRAPHY.bodyMedium,
  },

  input: {
    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    backgroundColor: COLORS.inputBg,

    paddingHorizontal: SPACING.md,

    paddingVertical: SPACING.md,

    color: COLORS.textPrimary,

    fontSize: 15,
  },

  error: {
    marginTop: SPACING.xs,

    color: COLORS.error,

    fontSize: 12,
  },
});