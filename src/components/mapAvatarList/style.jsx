import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  /* CONTACT AVATARS */

  avatarRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SW(12),
    marginTop: SW(4),
    paddingVertical: SW(6),
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },

  refreshIconBtn: {
    width: SW(28),
    height: SW(28),
    borderRadius: SW(14),
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.35)',
    backgroundColor: 'rgba(46, 213, 115, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SW(6),
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  avatarRow: {
    flexGrow: 0,
  },

  avatarRowContent: {
    paddingRight: SW(8),
    alignItems: 'center',
    gap: SW(6),
  },
  avatarItem: {
    alignItems: 'center',
    marginRight: SW(2),
  },
  avatarCircleWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: SW(38),
    height: SW(38),
    borderRadius: SW(19),
    borderWidth: SW(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    color: appColors.white,
  },
  onlineDot: {
    position: 'absolute',
    right: SW(0),
    bottom: SW(0),
    width: SW(9),
    height: SW(9),
    borderRadius: SW(4.5),
    backgroundColor: '#2ED573',
    borderWidth: 1.5,
    borderColor: '#0A1628',
  },
  avatarAdd: {
    width: SW(38),
    height: SW(38),
    borderRadius: SW(19),
    borderWidth: SW(1.5),
    borderColor: '#4DA3FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4DA3FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  avatarText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoExtraBold,
    fontSize: SF(15),
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: SW(19),
  },

  avatarLabel: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(10),
    marginTop: 3,
    textAlign: 'center',
    lineHeight: SF(12),
  },

  avatarPhoneNumber: {
    color: appColors.white,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(8),
    marginTop: 1,
  },

  selectedDot: {
    width: SW(12),
    height: SW(12),
    borderRadius: SW(6),
    marginTop: SH(6),
    borderWidth: 2,
    borderColor: '#EAF2FF',
    backgroundColor: '#4DA3FF',
    shadowColor: '#4DA3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
});
