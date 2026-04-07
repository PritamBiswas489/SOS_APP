import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  /* CONTACT AVATARS */

  avatarRowContainer: {
    paddingHorizontal: SW(18),
    marginTop: SW(16),
    borderTopColor: appColors.secondary,
    borderTopWidth: 0.8,
    borderBottomColor: appColors.secondary,
    borderBottomWidth: 0.8,
    paddingVertical: SW(12),
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },

  avatarRow: {
    flexGrow: 0,
  },

  avatarRowContent: {
    paddingRight: SW(12),
    alignItems: 'center',
    gap: SW(8),
  },
  avatarItem: {
    alignItems: 'center',
    marginRight: SW(4),
  },
  avatarCircle: {
    width: SW(48),
    height: SW(48),
    borderRadius: SW(24),
    borderWidth: SW(1.8),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarAdd: {
    width: SW(48),
    height: SW(48),
    borderRadius: SW(24),
    borderWidth: SW(1.8),
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
    fontSize: SF(18),
  },

  avatarLabel: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(12),
    marginTop: 6,
    textAlign: 'center',
    lineHeight: SF(14),
  },

  avatarPhoneNumber: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(9),
    marginTop: 2,
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
