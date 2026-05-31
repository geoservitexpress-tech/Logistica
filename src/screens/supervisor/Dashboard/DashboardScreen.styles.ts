// src/screens/supervisor/Dashboard/DashboardScreen.styles.ts

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '@/theme';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.lg,
    marginBottom: SPACING.xl,
  },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.navy },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 2 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.navy, marginBottom: 4 },
  sectionSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  statCard: {
    width: '47%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  statValue: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  quickIcon: { fontSize: 24, marginBottom: SPACING.sm },
  quickLabel: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, textAlign: 'center', fontWeight: '600' },
});