import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfileImage } from '../../config/utility';
 

// ── Session status config ──────────────────────────────────────────────────
const SESSION_STATUS_CONFIG = {
  active:    { color: '#4ADE80', icon: 'shield-alert-outline',  label: 'Active'    },
  expired:   { color: '#FACC15', icon: 'clock-alert-outline',   label: 'Expired'   },
  cancelled: { color: '#F87171', icon: 'close-circle-outline',  label: 'Cancelled' },
  resolved:  { color: '#818CF8', icon: 'check-circle-outline',  label: 'Resolved'  },
};

// ── My response status config ──────────────────────────────────────────────
const RESPONSE_STATUS_CONFIG = {
  pending:    { color: '#FACC15', icon: 'clock-outline',        label: 'Pending'    },
  accepted:   { color: '#4ADE80', icon: 'check-circle-outline', label: 'Accepted'   },
  on_the_way: { color: '#4A9EFF', icon: 'car-arrow-right',      label: 'On the way' },
  declined:   { color: '#F87171', icon: 'close-circle-outline', label: 'Declined'   },
};

const AVATAR_COLORS = ['#4A9EFF', '#4ADE80', '#FACC15', '#F87171', '#818CF8', '#FB923C'];

const formatTime = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

const UserAvatar = ({ user, size = 52 }) => {
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const color = AVATAR_COLORS[Number(user?.id ?? 0) % AVATAR_COLORS.length];
  if (user?.profile_photo) {
    return (
      <Image
        source={{ uri: getProfileImage(user.profile_photo) }}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, borderColor: '#FF3B5C40' },
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color + '22', borderColor: color,
        },
      ]}>
      <Text style={[styles.avatarInitial, { fontSize: size * 0.38, color }]}>{initial}</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Incoming SOS card
// ---------------------------------------------------------------------------
const IncomingCard = ({ item, navigationRef, onAccept, onDecline, onClose }) => {
  const session       = item.sos_session ?? {};
  const sender        = session.user ?? {};
  const sessionStatus = (session.status ?? 'active').toLowerCase();
  const responseStatus = (item.response_status ?? 'pending').toLowerCase();
   
  const sCfg = SESSION_STATUS_CONFIG[sessionStatus]   ?? SESSION_STATUS_CONFIG.active;
  const rCfg = RESPONSE_STATUS_CONFIG[responseStatus] ?? RESPONSE_STATUS_CONFIG.pending;

  return (
    <View style={[styles.card, { borderColor: sCfg.color + '30' }]}>

      {/* ── Top row: badge + session status pill ── */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Icon name="shield-alert" size={14} color="#FF3B5C" />
          <Text style={styles.badgeText}>INCOMING SOS</Text>
        </View>
        <View style={[
          styles.statusPill,
          { backgroundColor: sCfg.color + '18', borderColor: sCfg.color + '50' },
        ]}>
          <Icon name={sCfg.icon} size={11} color={sCfg.color} />
          <Text style={[styles.statusPillText, { color: sCfg.color }]}>{sCfg.label}</Text>
        </View>
      </View>

      {/* ── Meta row: time · trigger # · alert # ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon name="clock-outline" size={12} color="#6B7C99" />
          <Text style={styles.metaText}>{formatTime(session.created_at)}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Icon name="repeat-variant" size={12} color="#6B7C99" />
          <Text style={styles.metaText}>Trigger #{session.number_of_trigger ?? 1}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Icon name="bell-outline" size={12} color="#6B7C99" />
          <Text style={styles.metaText}>Alert #{item.alert_number ?? 1}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Sender profile ── */}
      <View style={styles.profileRow}>
        <UserAvatar user={sender} size={52} />
        <View style={styles.profileInfo}>
          <Text style={styles.senderName} numberOfLines={1}>
            {sender.name ?? 'Unknown'}
          </Text>
          <View style={styles.phoneRow}>
            <Icon name="phone-outline" size={12} color="#6B7C99" />
            <Text style={styles.phoneText}>{sender.phone_number ?? '—'}</Text>
          </View>
          <View style={[
            styles.responseBadge,
            { backgroundColor: rCfg.color + '18', borderColor: rCfg.color + '40' },
          ]}>
            <Icon name={rCfg.icon} size={11} color={rCfg.color} />
            <Text style={[styles.responseBadgeText, { color: rCfg.color }]}>
              My status: {rCfg.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Accept / Decline (pending only) ── */}
      {responseStatus === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onDecline?.(item)}
            activeOpacity={0.7}>
            <Icon name="close-circle-outline" size={15} color="#F87171" />
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept?.(item)}
            activeOpacity={0.7}>
            <Icon name="check-circle-outline" size={15} color="#4ADE80" />
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      {/* ── Action buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          if (navigationRef.isReady()) {
            onClose?.();
            navigationRef.navigate('Main', {
              screen: 'MainTabs',
              params: {
                screen: 'Chat',
                params: { selectedMapRecipentId: item.sos_session?.user?.id },
              },
            });
          }
        }} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconChat]}>
            <Icon name="chat-outline" size={20} color="#4A9EFF" />
          </View>
          <Text style={[styles.actionLabel, { color: '#4A9EFF' }]}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          if (navigationRef.isReady()) {
            onClose?.();
            navigationRef.navigate('Main', {
              screen: 'MainTabs',
              params: {
                screen: 'AudioStream',
                params: { selectedMapRecipentId: item.sos_session?.user?.id },
              },
            });
          }
        }} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconAudio]}>
            <Icon name="waveform" size={20} color="#00FF9C" />
          </View>
          <Text style={[styles.actionLabel, { color: '#00FF9C' }]}>Stream</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          if (navigationRef.isReady()) {
            onClose?.();
            navigationRef.navigate('Main', {
              screen: 'MainTabs',
              params: {
                screen: 'Map',
                params: { selectedMapRecipentId: item.sos_session?.user?.id },
              },
            });
          }
        }} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconMap]}>
            <Icon name="map-outline" size={20} color="#FFA502" />
          </View>
          <Text style={[styles.actionLabel, { color: '#FFA502' }]}>Map</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#071022',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  // top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#FF3B5C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#6B7C99',
    fontSize: 12,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(107,124,153,0.25)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  // profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    borderWidth: 1.5,
  },
  avatarFallback: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  senderName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneText: {
    color: '#6B7C99',
    fontSize: 12,
  },
  responseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  responseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconChat:  { backgroundColor: 'rgba(74,158,255,0.12)' },
  actionIconAudio: { backgroundColor: 'rgba(0,255,156,0.10)'  },
  actionIconMap:   { backgroundColor: 'rgba(255,165,2,0.10)'  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // accept / decline
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  declineBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  acceptBtnText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default IncomingCard;

 

 