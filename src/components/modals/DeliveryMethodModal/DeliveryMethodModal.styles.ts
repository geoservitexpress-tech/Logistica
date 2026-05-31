import {
  Platform,
  StyleSheet,
} from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from '@/theme';

export default StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.4)',

    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: COLORS.white,

    borderTopLeftRadius: RADIUS.xl,

    borderTopRightRadius: RADIUS.xl,

    padding: SPACING.xxl,

    paddingBottom:
      Platform.OS === 'ios'
        ? 40
        : SPACING.xxl,
  },

  iconWrap: {
    alignSelf: 'center',

    width: 64,

    height: 64,

    borderRadius: RADIUS.full,

    backgroundColor: COLORS.bg,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: SPACING.lg,
  },

  iconEmoji: {
    fontSize: 28,
  },

  title: {
    ...TYPOGRAPHY.h2,

    color: COLORS.textPrimary,

    textAlign: 'center',

    marginBottom: SPACING.sm,
  },

  subtitle: {
    ...TYPOGRAPHY.body,

    color: COLORS.textSecondary,

    textAlign: 'center',

    lineHeight: 20,

    marginBottom: SPACING.xxl,
  },

  option: {
    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    padding: SPACING.lg,

    marginBottom: SPACING.md,
  },

  optionIcon: {
    width: 44,

    height: 44,

    borderRadius: RADIUS.sm,

    backgroundColor: COLORS.bg,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: SPACING.md,
  },

  optionEmoji: {
    fontSize: 22,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    ...TYPOGRAPHY.bodyMedium,

    color: COLORS.textPrimary,

    marginBottom: 2,
  },

  optionDesc: {
    ...TYPOGRAPHY.body,

    color: COLORS.textSecondary,
  },

  chevron: {
    fontSize: 22,

    color: COLORS.textSecondary,
  },

  cancelBtn: {
    alignItems: 'flex-end',

    marginTop: SPACING.md,

    padding: SPACING.sm,
  },

  cancelText: {
    ...TYPOGRAPHY.bodyMedium,

    color: COLORS.textPrimary,
  },
});