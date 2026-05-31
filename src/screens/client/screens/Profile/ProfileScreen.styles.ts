import {
  StyleSheet,
  Platform,
} from 'react-native';

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../../../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
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

  topTitle: {
    ...TYPOGRAPHY.button,
    color: COLORS.navy,
    letterSpacing: 1,
  },

  topIconBtn: {
    padding: SPACING.sm,
  },

  avatarCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,

    padding: SPACING.xxl,

    alignItems: 'center',

    marginBottom: SPACING.lg,

    ...SHADOWS.card,
  },

  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 3,
    borderColor: COLORS.white,
  },

  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,

    borderWidth: 3,
    borderColor: COLORS.white,
  },

  avatarText: {
    fontSize: 36,
    color: COLORS.white,
    fontWeight: '700',
  },

  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,

    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: COLORS.white,
  },

  editIcon: {
    fontSize: 12,
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },

  userRol: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  verificado: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#DCFCE7',

    borderRadius: RADIUS.full,

    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,

    gap: SPACING.xs,
  },

  verificadoTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  statCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },

  statCardDark: {
    backgroundColor: COLORS.navy,
  },

  statCardLight: {
    backgroundColor: COLORS.white,
    ...SHADOWS.card,
  },

  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },

  statValDark: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },

  statValLight: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
  },

  statLabelDark: {
    fontSize: 11,
    color: '#9BB4CC',
    letterSpacing: 1,
    marginTop: 4,
  },

  statLabelLight: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },

  menuCard: {
    backgroundColor: COLORS.white,

    borderRadius: RADIUS.xl,

    marginBottom: SPACING.lg,

    overflow: 'hidden',

    ...SHADOWS.card,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: SPACING.lg,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuIconBox: {
    width: 40,
    height: 40,

    borderRadius: RADIUS.sm,

    backgroundColor: COLORS.bg,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: SPACING.md,
  },

  menuEmoji: {
    fontSize: 20,
  },

  menuTexts: {
    flex: 1,
  },

  menuNombre: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  menuDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  menuChevron: {
    fontSize: 18,
    color: COLORS.textMuted,
  },

  logoutBtn: {
    backgroundColor: COLORS.errorBg,

    borderRadius: RADIUS.xl,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    padding: SPACING.lg,

    gap: SPACING.sm,
  },

  logoutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
  },
});