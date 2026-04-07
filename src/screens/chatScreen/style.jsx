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

  chatContent: {
    paddingBottom: SW(8),
  },

  chatContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SW(24),
  },

  emptyStateWrapper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: appColors.secondary,
    borderRadius: SW(16),
    paddingVertical: SH(24),
    paddingHorizontal: SW(18),
  },

  emptyStateIconCircle: {
    width: SW(60),
    height: SW(60),
    borderRadius: SW(30),
    backgroundColor: 'rgba(143, 163, 200, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SH(12),
  },

  emptyStateTitle: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(16),
    marginBottom: SH(8),
  },

  emptyStateSubtitle: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(12),
    textAlign: 'center',
    lineHeight: SF(18),
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
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

  avatarRowContainer: {
    paddingHorizontal: SW(18),
    marginTop: SW(18),
    borderTopColor: appColors.secondary,
    borderTopWidth: 1,
    borderBottomColor: appColors.secondary,
    borderBottomWidth: 1,
    paddingVertical: SW(10),
  },

  avatarRow: {
    flexGrow: 0,
  },

  avatarRowContent: {
    paddingRight: SW(12),
    alignItems: 'center',
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
    overflow: 'hidden',
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

  messageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: SW(48),
    marginTop: 2,
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
    borderRadius: SW(19),
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendBtnDisabled: {
    opacity: 0.7,
  },

  /* MEDIA BUBBLES */

  mediaBubbleImage: {
    width: SW(200),
    height: SW(160),
    borderRadius: SW(8),
    marginBottom: SW(4),
    backgroundColor: appColors.secondary,
  },

  mediaBubbleVideo: {
    width: SW(200),
    height: SW(120),
    borderRadius: SW(8),
    marginBottom: SW(4),
    backgroundColor: '#1A2B44',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mediaBubblePlayBtn: {
    width: SW(48),
    height: SW(48),
    borderRadius: SW(24),
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SW(4),
  },

  mediaBubbleAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B44',
    borderRadius: SW(8),
    paddingVertical: SW(10),
    paddingHorizontal: SW(12),
    marginBottom: SW(4),
    minWidth: SW(140),
  },

  mediaBubbleDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B44',
    borderRadius: SW(8),
    paddingVertical: SW(10),
    paddingHorizontal: SW(12),
    marginBottom: SW(4),
    minWidth: SW(140),
  },

  mediaBubbleLabel: {
    color: appColors.white,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(12),
    marginLeft: SW(8),
  },

  previewWrapper: {
    marginHorizontal: SW(12),
    marginBottom: SW(8),
    borderWidth: 1,
    borderColor: appColors.secondary,
    backgroundColor: appColors.primaryAA,
    borderRadius: SW(12),
    padding: SW(10),
    flexDirection: 'row',
    alignItems: 'center',
  },

  previewImageContainer: {
    position: 'relative',
  },

  previewImage: {
    width: SW(52),
    height: SW(52),
    borderRadius: SW(10),
    backgroundColor: appColors.secondary,
  },

  previewImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: SW(10),
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewMetaContainer: {
    flex: 1,
    marginHorizontal: SW(10),
  },

  previewTitle: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(12),
  },

  previewSubtitle: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(10),
    marginTop: SH(2),
  },

  previewRemoveBtn: {
    width: SW(28),
    height: SW(28),
    borderRadius: SW(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.secondary,
  },

  scrollToBottomBtn: {
    position: 'absolute',
    right: SW(16),
    bottom: SW(88),
    width: SW(38),
    height: SW(38),
    borderRadius: SW(19),
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
  },

  actionSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  actionSheetContainer: {
    backgroundColor: '#111A2F',
    borderTopLeftRadius: SW(18),
    borderTopRightRadius: SW(18),
    paddingHorizontal: SW(14),
    paddingTop: SW(12),
    paddingBottom: SW(22),
    borderTopColor: appColors.secondary,
    borderTopWidth: 1,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SW(12),
    paddingHorizontal: SW(10),
    borderRadius: SW(10),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: SW(8),
  },

  actionText: {
    color: appColors.white,
    marginLeft: SW(10),
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(13),
  },

  cancelActionItem: {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
  },

  cancelActionText: {
    color: '#FF6B6B',
    marginLeft: SW(10),
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(13),
  },

  /* TYPING INDICATOR */

  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SW(16),
    paddingVertical: SH(6),
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SW(6),
  },

  typingDot: {
    width: SW(6),
    height: SW(6),
    borderRadius: SW(3),
    backgroundColor: appColors.bodyColor,
    marginHorizontal: SW(2),
    opacity: 0.6,
  },

  typingDotOne: {},
  typingDotTwo: {},
  typingDotThree: {},

  typingIndicatorText: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(11),
    fontStyle: 'italic',
  },
});
