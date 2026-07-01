import {
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../../theme';
interface Styles {
  flex: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  row: ViewStyle;
  halfCol: ViewStyle;

  topBar: ViewStyle;
  topBarTitle: TextStyle;
  topBarIcon: TextStyle;
  backBtn: ViewStyle;
  backIcon: TextStyle;

  screenTitle: TextStyle;
  screenSubtitle: TextStyle;

  card: ViewStyle;
  cardHeader: ViewStyle;
  iconContainer: ViewStyle;
  cardTitle: TextStyle;

  label: TextStyle;
  required: TextStyle;

  input: TextStyle;
  inputMultiline: TextStyle;
  inputFlex: TextStyle;
  inputNum: TextStyle;
  inputError: ViewStyle;
  dropdownError: ViewStyle;

  dropdown: ViewStyle;
  dropdownSm: ViewStyle;
  dropdownText: TextStyle;
  dropdownArrow: TextStyle;

  hashSymbol: TextStyle;
  separator: TextStyle;

  weightContainer: ViewStyle;
  weightInput: TextStyle;
  weightUnit: TextStyle;

  valueContainer: ViewStyle;
  currencySymbol: TextStyle;
  valueInput: TextStyle;

  fragileRow: ViewStyle;
  fragileBadge: ViewStyle;
  fragileBadgeText: TextStyle;

  photoRow: ViewStyle;
  photoButton: ViewStyle;
  photoButtonAdd: ViewStyle;
  photoThumb: ViewStyle;
  photoImg: ImageStyle;
  photoDelete: ViewStyle;
  photoDeleteTxt: TextStyle;
  photoIcon: TextStyle;
  photoLabel: TextStyle;

  bottomBar: ViewStyle;
  createButton: ViewStyle;
  createButtonText: TextStyle;

  menuOverlay: ViewStyle;
  menuContainer: ViewStyle;
  menuItem: ViewStyle;
  menuItemText: TextStyle;
}

export default StyleSheet.create<Styles>({
  flex:          { flex: 1 },
  container:     { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  halfCol:       { flex: 1 },

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
  topBarIcon:  { fontSize: 20 },
  backBtn:     { padding: SPACING.xs },
  backIcon:    { fontSize: 22, color: COLORS.textPrimary },

  screenTitle:    { ...TYPOGRAPHY.h1, color: COLORS.textPrimary, marginBottom: 4 },
  screenSubtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight, // ← reemplaza COLORS.iconBg que no existe
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardTitle: { ...TYPOGRAPHY.button, color: COLORS.textPrimary },

  label:    { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  required: { color: COLORS.error },

  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputMultiline: { height: 80, paddingTop: SPACING.md },
  inputFlex:      { flex: 1 },
  inputNum:       { width: 70 },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  dropdownError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
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
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm + 2,
  },
  dropdownSm:    { width: 100 },
  dropdownText:  { ...TYPOGRAPHY.bodyMedium, fontSize: 15, color: COLORS.textPrimary },
  dropdownArrow: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },

  hashSymbol: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginRight: 4 },
  separator:  { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: 4 },

  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.inputBg,
    overflow: 'hidden',
  },
  weightInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  weightUnit: {
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.bg,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm + 2,
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: { fontSize: 16, color: COLORS.textSecondary, marginRight: SPACING.sm },
  valueInput:     { flex: 1, paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm, fontSize: 15, color: COLORS.textPrimary },

  fragileRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  fragileBadge:     { backgroundColor: COLORS.errorBg, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  fragileBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.error, letterSpacing: 1 },

  photoRow:    { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs, flexWrap: 'wrap' },
  photoButton: {
    width: 90, height: 90,
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
  },
  photoButtonAdd: {
    width: 90, height: 90,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  photoThumb:  { width: 90, height: 90, borderRadius: RADIUS.md, position: 'relative' },
  photoImg:    { width: 90, height: 90, borderRadius: RADIUS.md },
  photoDelete: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.error, alignItems: 'center', justifyContent: 'center',
  },
  photoDeleteTxt: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  photoIcon:      { fontSize: 28, marginBottom: SPACING.xs },
  photoLabel:     { fontSize: 11, color: COLORS.textSecondary },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  createButtonText: { ...TYPOGRAPHY.button, fontSize: 17, color: COLORS.white },

  menuOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, width: 220, overflow: 'hidden', ...SHADOWS.card },
  menuItem:      { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemText:  { fontSize: 15, color: COLORS.textPrimary },
});