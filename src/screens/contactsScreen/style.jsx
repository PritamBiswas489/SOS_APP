import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.DarkPrimary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SW(18),
    paddingTop: SW(45),
    marginBottom: SW(20),
  },

  title: {
    color: appColors.white,
    fontSize: SF(22),
    fontFamily: appFonts.NunitoBold,
  },

  subtitle: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoSemiBold,
    fontSize: SF(12),
    marginTop: SW(4),
  },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SW(18),
    marginBottom: SW(12),
    backgroundColor: appColors.secondary,
    borderRadius: SW(12),
    padding: SW(4),
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SW(10),
    paddingVertical: SW(10),
    paddingHorizontal: SW(6),
  },

  activeTabButton: {
    backgroundColor: appColors.blue,
  },

  tabText: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoSemiBold,
    fontSize: SF(10),
    textAlign: 'center',
  },

  activeTabText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SW(18),
    paddingVertical: SW(10),
    borderBottomWidth: 1,
    borderBottomColor: appColors.whiteTransparent,
  },

  avatar: {
    width: SW(42),
    height: SW(42),
    borderRadius: SW(21),
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoExtraBold,
    fontSize: SF(16),
  },

  contactInfo: {
    flex: 1,
    marginLeft: SW(12),
  },

  contactName: {
    color: appColors.white,
    fontSize: SF(15),
    fontFamily: appFonts.NunitoBold,
  },

  contactDetails: {
    color: appColors.bodyColor,
    fontSize: SF(12),
    marginTop: SW(3),
    fontFamily: appFonts.NunitoSemiBold,
  },

  statusDot: {
    width: SW(10),
    height: SW(10),
    borderRadius: SW(5),
    marginRight: SW(10),
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconButton: {
    width: SW(30),
    height: SW(30),
    borderRadius: SW(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.secondary,
    marginLeft: SW(6),
  },

  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: appColors.blue,
    marginHorizontal: SW(20),
    marginTop: SW(25),
    paddingVertical: SW(15),
    borderRadius: SW(12),
    alignItems: 'center',
  },

  addText: {
    color: appColors.blue,
    fontSize: SF(13),
    fontFamily: appFonts.NunitoSemiBold,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: appColors.secondary,
    marginHorizontal: SW(20),
    marginTop: SW(20),
    padding: SW(15),
    borderRadius: SW(12),
  },

  infoText: {
    color: appColors.bodyColor,
    fontSize: SF(12),
    marginLeft: SW(8),
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: appColors.DarkPrimary,
    borderRadius: SW(16),
    padding: SW(20),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SW(15),
  },

  modalTitle: {
    color: appColors.white,
    fontSize: SF(18),
    fontFamily: appFonts.NunitoBold,
  },

  input: {
    backgroundColor: appColors.secondary,
    borderRadius: SW(10),
    paddingHorizontal: SW(15),
    paddingVertical: SW(12),
    color: appColors.white,
    marginBottom: SW(12),
  },

  saveBtn: {
    backgroundColor: appColors.blue,
    paddingVertical: SW(14),
    borderRadius: SW(10),
    alignItems: 'center',
  },

  saveText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(14),
  },
});

export default styles;
