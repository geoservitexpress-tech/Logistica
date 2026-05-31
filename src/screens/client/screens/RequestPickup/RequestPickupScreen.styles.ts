import { StyleSheet, Platform } from 'react-native';

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../../../../theme';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    padding: SPACING.lg,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop:
      Platform.OS === 'ios'
        ? 50
        : SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
  },

  backBtn: {
    padding: SPACING.xs,
  },

  backIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  screenTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  screenSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,

    ...SHADOWS.card,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  cardTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  label: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },

  required: {
    color: COLORS.error,
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical:
      Platform.OS === 'ios'
        ? SPACING.md
        : SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  inputMultiline: {
    height: 80,
    paddingTop: SPACING.md,
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical:
      Platform.OS === 'ios'
        ? SPACING.md
        : SPACING.sm + 2,
  },

  dropdownText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  rowAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  numFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  numLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 4,
  },

  numInput: {
    width: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical:
      Platform.OS === 'ios'
        ? SPACING.sm
        : 6,
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },

  dash: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },

  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  cancelButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    alignItems: 'center',

    ...SHADOWS.button,
  },

  submitButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },

  expressBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  expressTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },

  expressDesc: {
    ...TYPOGRAPHY.body,
    color: '#9BB4CC',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },

  expressBullets: {
    gap: SPACING.sm,
  },

  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  bulletText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.white,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom:
      Platform.OS === 'ios'
        ? 20
        : 0,
  },

  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },

  navLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  navLabelActive: {
    color: COLORS.primary,
  },
});