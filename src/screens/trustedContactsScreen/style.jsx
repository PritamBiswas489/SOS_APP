import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  subtitle: {
    color: '#6B7C99',
    fontSize: 11,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1A33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ED573',
    marginRight: 6,
  },

  liveText: {
    color: '#2ED573',
    fontSize: 11,
  },

  /* CONTACT AVATARS */

  avatarRow: {
    flexDirection: 'row',
    paddingHorizontal: SW(18),
    marginTop: SW(18),
    borderTopColor: appColors.secondary,
    borderTopWidth: 1,
    borderBottomColor: appColors.secondary,
    borderBottomWidth: 1,
    paddingVertical: SW(10),
  },

  avatarItem: {
    alignItems: 'center',
    marginRight: 16,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarAdd: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#4DA3FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },

  avatarLabel: {
    color: '#6B7C99',
    fontSize: 11,
    marginTop: 4,
  },

  /* DAY */

  dayLabel: {
    textAlign: 'center',
    color: '#6B7C99',
    fontSize: 11,
    marginTop: 20,
  },

  /* SOS ALERT */

  sosCard: {
    backgroundColor: '#5C141C',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
  },

  sosBadge: {
    backgroundColor: '#8E1D27',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },

  sosBadgeText: {
    color: '#fff',
    fontSize: 10,
  },

  sosMessage: {
    color: '#fff',
    fontSize: 14,
  },

  /* GPS CARD */

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C2A3A',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
  },

  locationText: {
    color: '#6B7C99',
    fontSize: 12,
    marginLeft: 6,
  },

  /* MESSAGE LEFT */

  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    marginLeft: 16,
  },

  bubbleLeft: {
    backgroundColor: '#1C2538',
    padding: 12,
    borderRadius: 14,
    maxWidth: '68%',
  },

  messageText: {
    color: '#fff',
    fontSize: 13,
  },

  avatarSmallRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  avatarSmallBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4DA3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  avatarSmallText: {
    color: '#fff',
    fontSize: 11,
  },

  /* MESSAGE RIGHT */

  messageRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginRight: 16,
  },

  bubbleRight: {
    backgroundColor: '#5C141C',
    padding: 12,
    borderRadius: 14,
    maxWidth: '68%',
  },

  avatarSmallPink: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  /* TIMES */

  timeLeft: {
    color: '#6B7C99',
    fontSize: 10,
    marginLeft: 52,
    marginTop: 4,
  },

  timeRight: {
    color: '#6B7C99',
    fontSize: 10,
    textAlign: 'right',
    marginRight: 52,
    marginTop: 4,
  },

  /* INPUT BAR */

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#0E1A33',
    marginHorizontal: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderTopColor: appColors.secondary,
    borderTopWidth: 1,
    borderBottomColor: appColors.secondary,
    borderBottomWidth: 1,
    paddingVertical: SW(10),
  },

  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    backgroundColor: appColors.primaryAA,
    marginHorizontal: SW(12),
    height: SW(42),
    paddingHorizontal: SW(15),
    borderRadius: SW(20),
  },

  sendBtn: {
    backgroundColor: '#FF3B5C',
    width: SW(38),
    height: SW(38),
    borderRadius: SW(38),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
