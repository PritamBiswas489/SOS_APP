import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  map: {
    flex: 1,
  },

  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4DA3FF',
    borderWidth: 3,
    borderColor: '#fff',
  },

  markerContainer: {
    alignItems: 'center',
  },

  searchBar: {
    position: 'absolute',
    top: 95,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1A33',
    padding: 12,
    borderRadius: 20,
  },

  searchText: {
    flex: 1,
    color: '#A4B0BE',
    marginLeft: 6,
  },

  searchBtn: {
    backgroundColor: '#16213E',
    padding: 8,
    borderRadius: 12,
  },

  locationCard: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E1A33',
    padding: 15,
    borderRadius: 16,
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B5C',
    marginRight: 10,
  },

  locationTitle: {
    color: '#fff',
    fontWeight: '600',
  },

  locationSub: {
    color: '#6B7C99',
    fontSize: 11,
  },

  liveBadge: {
    backgroundColor: '#0C3F2C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },

  liveText: {
    color: '#2ED573',
    fontSize: 11,
  },
});
