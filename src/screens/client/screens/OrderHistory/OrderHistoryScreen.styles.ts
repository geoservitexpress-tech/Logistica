import { StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../../theme';

interface Styles {
  wrapper: ViewStyle;
  topBar: ViewStyle;
  topBarTitle: TextStyle;
  topBarIcon: TextStyle;
  avatar: ViewStyle;
  scrollContent: ViewStyle;
  statCard: ViewStyle;
  statRow: ViewStyle;
  statLabel: TextStyle;
  statIcon: TextStyle;
  statValue: TextStyle;
  statSub: TextStyle;
  sectionTitle: TextStyle;
  searchRow: ViewStyle;
  searchWrap: ViewStyle;
  searchIcon: TextStyle;
  searchInput: TextStyle;
  filterBtn: ViewStyle;
  orderCard: ViewStyle;
  orderTop: ViewStyle;
  orderIconWrap: ViewStyle;
  orderIconText: TextStyle;
  orderMeta: ViewStyle;
  orderId: TextStyle;
  orderDate: TextStyle;
  orderBottom: ViewStyle;
  orderRoute: TextStyle;
  iconBtn: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  emptyWrap: ViewStyle;
  emptyEmoji: TextStyle;
  emptyText: TextStyle;
  fab: ViewStyle;
  fabIcon: TextStyle;
}

export default StyleSheet.create<Styles>({
  wrapper: { flex: 1, backgroundColor: COLORS.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
  },

  topBarTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  topBarIcon: { fontSize: 20 },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: { padding: SPACING.lg, paddingBottom: 20 },

  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  statIcon: { fontSize: 22 },
  statValue: { ...TYPOGRAPHY.h1, color: COLORS.textPrimary, marginBottom: 4 },
  statSub: { ...TYPOGRAPHY.caption },

  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },

  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.card,
  },

  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchInput: { ...TYPOGRAPHY.body, flex: 1, color: COLORS.textPrimary, paddingVertical: SPACING.md },

  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },

  orderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },

  orderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  orderIconText: { fontSize: 22 },
  orderMeta: { flex: 1 },
  orderId: { ...TYPOGRAPHY.bodyMedium, fontSize: 15, color: COLORS.textPrimary },
  orderDate: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  orderBottom: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  orderRoute: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary },
  iconBtn: { padding: SPACING.sm },

  badge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  badgeText: { ...TYPOGRAPHY.caption, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },

  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },

  fabIcon: { fontSize: 28, color: COLORS.white, lineHeight: 32 },
});