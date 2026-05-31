// src/screens/supervisor/Team/TeamScreen.styles.ts

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '@/theme';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.lg,
    marginBottom: SPACING.xl,
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.navy },
  headerSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  repCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  repHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  repAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
  repNombre: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textPrimary, fontSize: 16 },
  repRol: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  repStatusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  repStatusText: { fontSize: 12, fontWeight: '700' },
  repStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  repStatItem: { alignItems: 'center' },
  repStatValue: { fontSize: 22, fontWeight: '800', color: COLORS.navy },
  repStatLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  progresoWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progresoBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progresoFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  progresoText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, width: 35 },
});