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

  required: {
    color: COLORS.error,
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

  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },

  error: {
    marginTop: SPACING.xs,

    color: COLORS.error,

    fontSize: 12,
  },
});