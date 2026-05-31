import { StyleSheet } from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  inner: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  backButton: {
    marginRight: SPACING.md,
  },

  backButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },

  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },

  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  subtitulo: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },

  roleLabel: {
    marginBottom: SPACING.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1.5,

    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    padding: SPACING.md,

    marginBottom: SPACING.sm,
  },

  roleOptionActive: {
    borderColor: COLORS.primary,

    backgroundColor:
      COLORS.primaryLight,
  },

  roleEmoji: {
    fontSize: 22,

    marginRight: SPACING.md,
  },

  roleTitle: {
    fontWeight: '700',

    color: COLORS.textPrimary,
  },

  roleTitleActive: {
    color: COLORS.primary,
  },

  roleDescription: {
    color: COLORS.textSecondary,

    fontSize: 12,
  },

  termsContainer: {
    flexDirection: 'row',

    marginTop: SPACING.lg,

    marginBottom: SPACING.xl,
  },

  checkbox: {
    width: 20,

    height: 20,

    borderRadius: 4,

    borderWidth: 1.5,

    borderColor: COLORS.border,

    marginRight: SPACING.sm,
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primary,
  },

  termsText: {
    flex: 1,

    color: COLORS.textSecondary,

    lineHeight: 20,
  },

  termsLink: {
    color: COLORS.primary,

    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: SPACING.xl,
  },

  footerText: {
    color: COLORS.textSecondary,
  },

  footerLink: {
    color: COLORS.primary,

    fontWeight: '700',
  },
});