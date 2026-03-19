import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.DarkPrimary,
    paddingHorizontal: SW(18),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SW(48),
  },

  headerText: {
    flex: 1,
    marginLeft: SW(10),
  },

  title: {
    color: appColors.white,
    fontSize: SF(17),
    fontFamily: appFonts.NunitoBold,
  },

  subtitle: {
    color: appColors.bodyColor,
    fontSize: SF(10),
    fontFamily: appFonts.NunitoSemiBold,
  },

  photoContainer: {
    alignItems: 'center',
    marginTop: SW(22),
  },

  photoCircle: {
    width: SW(86),
    height: SW(86),
    borderRadius: SW(43),
    borderWidth: SW(2),
    borderStyle: 'dashed',
    borderColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.primaryAA,
  },

  photoText: {
    color: appColors.bodyColor,
    fontSize: SF(11),
    marginTop: SW(8),
  },

  label: {
    color: appColors.bodyColor,
    fontSize: SF(11),
    marginTop: SW(20),
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whiteTransparent,
    borderColor: appColors.whiteBdrTransparent,
    borderWidth: 1,
    borderRadius: SW(14),
    paddingHorizontal: SW(10),
    height: SW(40),
    marginTop: 8,
  },

  inputBoxActive: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SW(14),
    paddingHorizontal: SW(12),
    marginTop: SW(8),
    borderWidth: 1,
    borderColor: appColors.primary,
  },

  input: {
    flex: 1,
    color: appColors.white,
    marginLeft: 10,
  },

  relationRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  relationTab: {
    borderWidth: 1,
    borderColor: '#1A2438',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },

  relationTabActive: {
    backgroundColor: '#4A1018',
    borderColor: appColors.primary,
  },

  relationText: {
    color: appColors.bodyColor,
    fontSize: 12,
  },

  relationTextActive: {
    color: appColors.white,
  },

  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appColors.whiteTransparent,
    borderColor: appColors.whiteBdrTransparent,
    borderWidth: 1,
    borderRadius: SW(14),
    padding: SW(14),
    marginTop: SW(15),
  },

  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLeftInner: {
    marginLeft: SW(10),
  },
  toggleTitle: {
    color: appColors.white,
    fontSize: SF(13),
  },

  toggleSubtitle: {
    color: appColors.bodyColor,
    fontSize: SF(10),
  },

  saveBtn: {
    backgroundColor: appColors.primary,
    borderRadius: SW(16),
    padding: SW(15),
    alignItems: 'center',
    marginTop: SW(18),
  },

  saveText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(13),
  },

  cancel: {
    textAlign: 'center',
    color: appColors.bodyColor,
    marginTop: SW(15),
    padding: SW(10),
    backgroundColor: appColors.whiteTransparent,
    borderColor: appColors.whiteBdrTransparent,
    borderWidth: 1,
    borderRadius: SW(14),
  },
});
