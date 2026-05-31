// src/screens/repartidor/Historial/HistorialRepartidorScreen.styles.ts

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
  header: {
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
  },
  statLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
  entregaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  horaText: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 2 },
  clienteText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  metodoTag: { marginTop: 4, fontSize: 10, fontWeight: '800', color: '#E8712A' },
  cardMonto: { alignItems: 'flex-end' },
  montoText: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
});