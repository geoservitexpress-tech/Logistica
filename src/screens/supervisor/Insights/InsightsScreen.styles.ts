// src/screens/supervisor/Insights/InsightsScreen.styles.ts

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
  tasaCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  tasaLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 4 },
  tasaValue: { fontSize: 48, fontWeight: '800', color: COLORS.navy, marginBottom: SPACING.md },
  tasaBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  tasaFill: { height: 12, backgroundColor: COLORS.primary, borderRadius: 6 },
  tasaSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.navy, marginBottom: SPACING.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  metricCard: {
    width: '47%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  metricIcon: { fontSize: 24, marginBottom: SPACING.sm },
  metricValue: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  metricLabel: { fontSize: 12, fontWeight: '600' },
});