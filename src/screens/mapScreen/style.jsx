import {StyleSheet} from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import {SH, SW, SF} from '../../theme/dimensions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  /* USER DOT */

  userDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(77, 163, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4DA3FF',
    borderWidth: 2.5,
    borderColor: '#fff',
  },

  /* CONTACT MARKERS */

  markerWrapper: {
    alignItems: 'center',
  },

  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  /* SEARCH BAR */

  searchBar: {
    position: 'absolute',
    top: SW(14),
    left: SW(20),
    right: SW(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1A33',
    paddingVertical: SW(12),
    paddingHorizontal: SW(16),
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  searchText: {
    flex: 1,
    color: '#A4B0BE',
    fontSize: SF(14),
    fontFamily: appFonts.NunitoSemiBold,
    marginLeft: 8,
  },

  searchBtn: {
    backgroundColor: '#16213E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* LOCATION CARD */

  locationCard: {
    position: 'absolute',
    bottom: SW(14),
    left: SW(20),
    right: SW(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E1A33',
    padding: SW(16),
    borderRadius: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  redDotContainer: {
    alignItems: 'center',
    marginRight: 12,
  },

  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B5C',
  },

  redDotLine: {
    width: 2,
    height: 16,
    backgroundColor: '#FF3B5C',
    borderRadius: 1,
    marginTop: 2,
  },

  locationTitle: {
    color: '#fff',
    fontSize: SF(15),
    fontFamily: appFonts.NunitoBold,
  },

  locationSub: {
    color: '#6B7C99',
    fontSize: SF(11),
    fontFamily: appFonts.NunitoRegular,
    marginTop: 2,
    lineHeight: SF(15),
  },

  liveBadge: {
    backgroundColor: '#0C3F2C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.3)',
  },

  liveText: {
    color: '#2ED573',
    fontSize: SF(12),
    fontFamily: appFonts.NunitoBold,
    letterSpacing: 1,
  },
});
