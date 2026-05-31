import { StyleSheet } from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '@/theme';

export const styles = StyleSheet.create({
  content: {
    flex: 1,

    justifyContent: 'center',
  },

  card: {
    backgroundColor: COLORS.white,

    borderRadius: RADIUS.xl,

    padding: SPACING.xxl,

    ...SHADOWS.card,
  },

  logoContainer: {
    alignItems: 'center',

    marginBottom: SPACING.xxxl,
  },

  logo: {
    fontSize: 54,
  },

  brand: {
    marginTop: SPACING.md,

    color: COLORS.navy,

    ...TYPOGRAPHY.h2,
  },

  subtitle: {
    marginTop: SPACING.sm,

    textAlign: 'center',

    color: COLORS.textSecondary,

    ...TYPOGRAPHY.body,
  },

  quickAccessTitle: {
    marginTop: SPACING.xxl,

    marginBottom: SPACING.md,

    textAlign: 'center',

    color: COLORS.textMuted,

    ...TYPOGRAPHY.caption,
  },

  quickButton: {
    backgroundColor: COLORS.navy,

    borderRadius: RADIUS.md,

    paddingVertical: SPACING.md,

    marginBottom: SPACING.sm,

    alignItems: 'center',
  },

  quickButtonText: {
    color: COLORS.white,

    ...TYPOGRAPHY.bodyMedium,
  },
});