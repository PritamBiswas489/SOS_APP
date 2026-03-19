import { StyleSheet } from 'react-native';
import appColors from '../../theme/appColors';
import appFonts from '../../theme/appFonts';
import { SH, SW, SF } from '../../theme/dimensions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },

  chatScroll: {
    flex: 1,
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
    fontSize: SF(18),
    fontFamily: appFonts.NunitoBold,
  },

  subtitle: {
    color: appColors.bodyColor,
    fontSize: SF(11),
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appColors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.green,
    marginRight: 6,
  },

  liveText: {
    color: appColors.green,
    fontSize: SF(11),
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
    marginRight: SW(12),
  },

  avatarCircle: {
    width: SW(40),
    height: SW(40),
    borderRadius: SW(20),
    borderWidth: SW(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarAdd: {
    width: SW(40),
    height: SW(40),
    borderRadius: SW(20),
    borderWidth: SW(1.5),
    borderColor: '#4DA3FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoExtraBold,
  },

  avatarLabel: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoExtraBold,
    fontSize: SF(11),
    marginTop: 4,
  },

  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  /* DAY */

  dayLabel: {
    textAlign: 'center',
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoExtraBold,
    fontSize: SF(10),
    marginTop: 20,
  },

  /* SOS ALERT */

  sosContainer: {
    alignItems: 'flex-end',
    marginHorizontal: SW(20),
    marginTop: SW(12),
  },

  sosCard: {
    backgroundColor: appColors.primaryAA,
    borderRadius: 14,
    padding: 14,
    maxWidth: '85%',
  },

  sosBadge: {
    backgroundColor: appColors.primary,
    paddingHorizontal: SW(7),
    paddingVertical: SW(3),
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },

  sosBadgeText: {
    color: appColors.white,
    fontSize: SF(10),
    fontFamily: appFonts.NunitoBold,
  },

  sosMessage: {
    color: appColors.white,
    fontSize: SF(13),
  },

  sosTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: SW(20),
    marginTop: SW(6),
  },

  sosTimeText: {
    color: appColors.bodyColor,
    fontSize: SF(10),
    fontFamily: appFonts.NunitoRegular,
    marginRight: SW(8),
  },

  /* GPS CARD */

  locationContainer: {
    alignItems: 'flex-end',
    marginHorizontal: SW(20),
    marginTop: SW(6),
  },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whiteBdrTransparent,
    padding: SW(8),
    borderRadius: SW(10),
  },

  locationText: {
    color: appColors.bodyColor,
    fontSize: SF(11),
    marginLeft: SF(5),
  },

  /* MESSAGE LEFT */

  bubbleLeftWrapper: {
    marginTop: SW(14),
    marginLeft: SW(14),
    maxWidth: '75%',
  },

  messageFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SW(6),
  },

  timeLeftInline: {
    color: appColors.bodyColor,
    fontSize: SF(10),
    fontFamily: appFonts.NunitoRegular,
    marginLeft: SW(6),
  },

  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: SW(14),
    marginLeft: SW(14),
  },

  bubbleLeft: {
    backgroundColor: appColors.whiteBdrTransparent,
    padding: SW(10),
    borderRadius: 14,
    maxWidth: '68%',
  },

  messageText: {
    color: appColors.white,
    fontSize: SF(12),
  },

  avatarSmallRed: {
    width: SW(25),
    height: SW(25),
    borderRadius: SW(25),
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SW(5),
  },

  avatarSmallBlue: {
    width: SW(25),
    height: SW(25),
    borderRadius: SW(25),
    backgroundColor: appColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SW(5),
  },

  avatarSmallText: {
    color: appColors.white,
    fontSize: SF(10),
  },

  /* MESSAGE RIGHT */

  messageRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: SW(15),
    marginRight: SW(15),
  },

  bubbleRight: {
    backgroundColor: '#5C141C',
    padding: SW(10),
    borderRadius: 14,
    maxWidth: '68%',
  },

  avatarSmallPink: {
    width: SW(25),
    height: SW(25),
    borderRadius: SW(25),
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  /* TIMES */

  timeLeft: {
    color: appColors.bodyColor,
    fontSize: SF(10),
    marginLeft: SW(48),
    marginTop: 4,
  },

  timeRight: {
    color: appColors.bodyColor,
    fontSize: SF(10),
    textAlign: 'right',
    marginRight: SW(48),
    marginTop: 4,
  },

  /* INPUT BAR */

  micBtn: {
    width: SW(36),
    height: SW(36),
    borderRadius: SW(18),
    backgroundColor: appColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#0E1A33',
    marginHorizontal: SW(12),
    marginBottom: SW(10),
    paddingHorizontal: SW(12),
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
    backgroundColor: appColors.primary,
    width: SW(38),
    height: SW(38),
    borderRadius: SW(38),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
