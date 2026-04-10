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

  historyLoaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SW(24),
  },

  historyLoaderCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: appColors.secondary,
    borderRadius: SW(16),
    paddingVertical: SH(24),
    paddingHorizontal: SW(20),
    minWidth: SW(220),
  },

  historyLoaderTitle: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(15),
    marginTop: SH(12),
  },

  historyLoaderSubtitle: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(11),
    marginTop: SH(4),
    textAlign: 'center',
  },

  historyLoaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SH(14),
    marginBottom: SH(2),
  },

  historyLoaderInlineText: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoSemiBold,
    fontSize: SF(11),
    marginLeft: SW(8),
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
  },

  bubbleLeft: {
    backgroundColor: appColors.whiteBdrTransparent,
    padding: SW(10),
    borderRadius: 14,
    maxWidth: '75%',
  },

  messageActionsRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  messageActionsRowLeft: {
    marginLeft: SW(8),
    marginBottom: SW(2),
  },

  messageActionsRowRight: {
    marginRight: SW(8),
    marginBottom: SW(2),
  },

  messageActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SW(28),
    height: SW(28),
    borderRadius: SW(14),
    backgroundColor: 'rgba(143, 163, 200, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(143, 163, 200, 0.22)',
  },

  messageActionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },

  messageActionModalSheet: {
    backgroundColor: '#0E1E35',
    borderTopLeftRadius: SW(20),
    borderTopRightRadius: SW(20),
    paddingBottom: SH(28),
    paddingTop: SH(10),
    paddingHorizontal: SW(16),
    borderTopWidth: 1,
    borderColor: 'rgba(143, 163, 200, 0.18)',
  },

  messageActionModalHandle: {
    width: SW(36),
    height: SW(4),
    borderRadius: SW(2),
    backgroundColor: 'rgba(143, 163, 200, 0.35)',
    alignSelf: 'center',
    marginBottom: SH(16),
  },

  messageActionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SH(14),
    paddingHorizontal: SW(8),
  },

  messageActionModalIconWrap: {
    width: SW(36),
    height: SW(36),
    borderRadius: SW(18),
    backgroundColor: 'rgba(96, 166, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SW(14),
  },

  messageActionModalText: {
    color: '#D7E3FF',
    fontSize: SF(15),
    fontFamily: appFonts.NunitoSemiBold,
  },

  messageActionModalDivider: {
    height: 1,
    backgroundColor: 'rgba(143, 163, 200, 0.12)',
    marginHorizontal: SW(4),
  },

  messageActionModalCancelItem: {
    justifyContent: 'center',
    marginTop: SH(6),
  },

  messageActionModalCancelText: {
    color: appColors.bodyColor,
    fontSize: SF(14),
    fontFamily: appFonts.NunitoRegular,
    textAlign: 'center',
    flex: 1,
  },

  messageText: {
    color: appColors.white,
    fontSize: SF(12),
  },

  replyPreviewBox: {
    borderLeftWidth: 2.5,
    borderRadius: SW(8),
    paddingVertical: SH(6),
    paddingHorizontal: SW(8),
    marginBottom: SW(6),
  },

  replyPreviewBoxLeft: {
    borderLeftColor: '#60A6FF',
    backgroundColor: 'rgba(96, 166, 255, 0.15)',
  },

  replyPreviewBoxRight: {
    borderLeftColor: '#FF8FA0',
    backgroundColor: 'rgba(255, 143, 160, 0.12)',
  },

  replyPreviewTitle: {
    color: '#D7E3FF',
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(10),
    marginBottom: SH(2),
  },

  replyPreviewText: {
    color: appColors.white,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(11),
    lineHeight: SF(15),
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
    maxWidth: '75%',
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

  locationMessageCard: {
    borderRadius: SW(10),
    padding: SW(10),
    marginBottom: SW(6),
    borderWidth: 1,
  },

  locationMessageCardLeft: {
    backgroundColor: 'rgba(61, 131, 255, 0.12)',
    borderColor: 'rgba(96, 166, 255, 0.35)',
  },

  locationMessageCardRight: {
    backgroundColor: 'rgba(255, 91, 109, 0.16)',
    borderColor: 'rgba(255, 126, 141, 0.38)',
  },

  locationMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationPinBadge: {
    width: SW(26),
    height: SW(26),
    borderRadius: SW(13),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    marginRight: SW(8),
  },

  locationMessageHeaderTextBlock: {
    flex: 1,
  },

  locationMessageTitle: {
    color: appColors.white,
    fontFamily: appFonts.NunitoBold,
    fontSize: SF(12),
  },

  locationMessageSubtitle: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoRegular,
    fontSize: SF(10),
    marginTop: SH(1),
  },

  locationCoordsRow: {
    marginTop: SH(8),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: SW(8),
    paddingVertical: SH(5),
    paddingHorizontal: SW(8),
  },

  locationCoordsLabel: {
    color: appColors.bodyColor,
    fontFamily: appFonts.NunitoExtraBold,
    fontSize: SF(9),
  },

  locationCoordsLabelSpacing: {
    marginLeft: SW(10),
  },

  locationCoordsValue: {
    color: appColors.white,
    fontFamily: appFonts.NunitoSemiBold,
    fontSize: SF(10),
    marginLeft: SW(4),
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

});
