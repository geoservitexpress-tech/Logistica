import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  /* ========================= */
  /* OVERLAY */
  /* ========================= */

  overlay: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor:
      'rgba(15,23,42,0.72)',

    padding: 18,
  },

  /* ========================= */
  /* MODAL */
  /* ========================= */

  modalContainer: {
    width: '92%',
    maxHeight: '92%',

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    paddingTop: 26,

    shadowColor: '#000',

    shadowOpacity: 0.12,
    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 12,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  /* ========================= */
  /* HEADER */
  /* ========================= */

  header: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    flex: 1,

    fontSize: 34,
    fontWeight: '800',

    color: '#0F172A',
  },

  closeButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',
  },

  divider: {
    height: 1,

    backgroundColor: '#E2E8F0',

    marginTop: 22,
    marginBottom: 26,
  },

  /* ========================= */
  /* TOP INFO */
  /* ========================= */

  topInfoContainer: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 26,
  },

  infoBlock: {
    flex: 1,
  },

  infoRight: {
    alignItems: 'flex-end',
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '700',

    letterSpacing: 1,

    color: '#A54B00',

    marginBottom: 6,
  },

  infoValue: {
    fontSize: 24,
    fontWeight: '800',

    color: '#0F172A',
  },

  infoDate: {
    fontSize: 14,
    fontWeight: '600',

    color: '#334155',

    textAlign: 'right',
  },

  /* ========================= */
  /* CARDS */
  /* ========================= */

  card: {
    backgroundColor: '#F5F6F8',

    borderRadius: 20,

    padding: 18,

    marginBottom: 18,
  },

  sectionContainer: {
    marginBottom: 22,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 14,
  },

  iconBox: {
    width: 34,
    height: 34,

    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFF3E8',

    marginRight: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',

    color: '#0F172A',
  },

  /* ========================= */
  /* TEXTS */
  /* ========================= */

  mainText: {
    fontSize: 20,
    fontWeight: '800',

    color: '#0F172A',

    marginBottom: 10,
  },

  addressText: {
    fontSize: 15,

    lineHeight: 24,

    color: '#334155',

    fontWeight: '500',
  },

  /* ========================= */
  /* PHONE */
  /* ========================= */

  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  phoneText: {
    marginLeft: 8,

    fontSize: 14,
    fontWeight: '600',

    color: '#15803D',
  },

  /* ========================= */
  /* OBSERVATION */
  /* ========================= */

  observationBox: {
    borderLeftWidth: 5,
    borderLeftColor: '#A54B00',

    backgroundColor: '#F8FAFC',

    borderRadius: 14,

    padding: 16,
  },

  observationText: {
    fontSize: 14,

    lineHeight: 24,

    color: '#475569',

    fontStyle: 'italic',
  },

  /* ========================= */
  /* IMAGES */
  /* ========================= */

  imageItem: {
    width: 110,
    height: 110,

    borderRadius: 18,

    marginRight: 14,
  },

  addPhotoCard: {
    width: 110,
    height: 110,

    borderRadius: 18,

    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',

    justifyContent: 'center',
    alignItems: 'center',
  },

  plusText: {
    marginTop: 4,

    fontSize: 22,
    fontWeight: '700',

    color: '#A54B00',
  },

  /* ========================= */
  /* FOOTER */
  /* ========================= */

  footerButtons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  routeButton: {
    height: 58,

    borderRadius: 18,

    backgroundColor: '#0F172A',

    marginBottom: 12,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  routeButtonText: {
    marginLeft: 10,

    fontSize: 16,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  closeModalButton: {
    height: 58,

    borderRadius: 18,

    backgroundColor: '#A54B00',

    justifyContent: 'center',
    alignItems: 'center',
  },

  closeModalText: {
    fontSize: 16,
    fontWeight: '800',

    color: '#FFFFFF',
  },

});