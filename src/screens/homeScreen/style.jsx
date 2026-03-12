import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.DarkPrimary,
  },

  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 50,
  },

  goodMorning: {
    color: '#7F8FA6',
    fontSize: SF(14),
    letterSpacing: 1,
  },

  userName: {
    // color:'#FFFFFF',
    fontSize: SF(30),
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontWeight: 'bold',
    marginTop: 5,
  },

  /* SOS */

  sosWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SH(50),
  },

  sosButton: {
    width: SW(160),
    height: SW(160),
    borderRadius: SW(80),
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: appColors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },

    elevation: 20,
  },

  sosText: {
    fontSize: SF(34),
    fontWeight: 'bold',
    color: appColors.white,
  },

  sosSubText: {
    fontSize: SF(12),
    color: appColors.whiteAA,
    fontFamily: appFonts.NunitoRegular,
    letterSpacing: 2,
    marginTop: 5,
  },

  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: appColors.primary,
  },

  glowRing2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: appColors.primary,
    opacity: 0.4,
  },

  /* Safe Card */

  safeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.lightGreen,
    marginHorizontal: SW(20),
    padding: 14,
    borderRadius: 12,
    marginBottom: 25,
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.green,
    marginRight: 10,
  },

  safeText: {
    color: appColors.green,
    fontSize: SF(14),
  },

  /* GRID */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  card: {
    width: '48%',
    backgroundColor: appColors.secondary,
    paddingVertical: SW(24),
    paddingHorizontal: SW(20),
    borderRadius: SW(20),
    marginBottom: 15,
  },

  cardNumber: {
    color: appColors.white,
    fontSize: SF(20),
    fontWeight: 'bold',
    marginTop: 10,
  },

  cardLabel: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(13),
    marginTop: 4,
  },
});

export default styles;
