import { StyleSheet } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.errorBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: SPACING.sm,
  },

  item: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 18,
  },

  more: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
