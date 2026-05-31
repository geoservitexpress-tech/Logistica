import {
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../../../../theme';

interface Styles {
  overlay: ViewStyle;
  dismissArea: ViewStyle;
  sheet: ViewStyle;

  header: ViewStyle;
  headerTitle: TextStyle;
  closeBtn: ViewStyle;
  closeIcon: TextStyle;
  divider: ViewStyle;

  scrollContent: ViewStyle;

  statusRow: ViewStyle;

  badge: ViewStyle;
  badgeSuccess: ViewStyle;
  badgeTransit: ViewStyle;
  badgePending: ViewStyle;

  badgeText: TextStyle;
  badgeSuccessText: TextStyle;
  badgeTransitText: TextStyle;
  badgePendingText: TextStyle;

  dateRow: ViewStyle;
  dateIcon: TextStyle;
  dateText: TextStyle;

  sectionLabel: TextStyle;

  courierCard: ViewStyle;
  courierAvatar: ViewStyle;
  courierAvatarText: TextStyle;
  courierInfo: ViewStyle;
  courierName: TextStyle;
  courierRole: TextStyle;

  callBtn: ViewStyle;

  infoCard: ViewStyle;
  infoCardRow: ViewStyle;
  infoCardTitle: TextStyle;
  infoName: TextStyle;
  infoPhone: TextStyle;

  paymentMethod: TextStyle;
  paymentStatus: TextStyle;

  routeText: TextStyle;

  evidenceRow: ViewStyle;
  evidenceThumb: ViewStyle;

  actionsWrap: ViewStyle;

  primaryBtn: ViewStyle;
  primaryBtnText: TextStyle;

  secondaryBtn: ViewStyle;
  secondaryBtnText: TextStyle;
}

export default StyleSheet.create<Styles>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  dismissArea: {
    flex: 1,
  },

  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    paddingBottom:
      Platform.OS === 'ios'
        ? 34
        : SPACING.lg,

    ...SHADOWS.card,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },

  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },

  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },

  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },

  badgeTransit: {
    backgroundColor: '#DBEAFE',
  },

  badgePending: {
    backgroundColor: '#FEF3C7',
  },

  badgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },

  badgeSuccessText: {
    color: COLORS.success,
  },

  badgeTransitText: {
    color: '#2563EB',
  },

  badgePendingText: {
    color: '#D97706',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  dateIcon: {
    fontSize: 14,
  },

  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  courierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  courierAvatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  courierInfo: {
    flex: 1,
  },

  courierName: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  courierRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  infoCardTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  infoName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },

  infoPhone: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  paymentMethod: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 2,
  },

  paymentStatus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  routeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },

  evidenceRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  evidenceThumb: {
    width: 100,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  actionsWrap: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },

  primaryBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',

    ...SHADOWS.button,
  },

  primaryBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  secondaryBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
  },
});