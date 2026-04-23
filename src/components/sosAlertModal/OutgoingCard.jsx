import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PulseDot } from './shared';
import { getProfileImage } from '../../config/utility';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  active:    { color: '#4ADE80', icon: 'shield-alert-outline',  label: 'ACTIVE' },
  expired:   { color: '#FACC15', icon: 'clock-alert-outline',   label: 'EXPIRED' },
  cancelled: { color: '#F87171', icon: 'close-circle-outline',  label: 'CANCELLED' },
  resolved:  { color: '#818CF8', icon: 'check-circle-outline',  label: 'RESOLVED' },
};

const AVATAR_COLORS = ['#FF3B5C', '#4A9EFF', '#00FF9C', '#FFA502', '#A855F7'];

const formatTime = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ContactAvatar = ({ user, size = 34 }) => {
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';
  const color = AVATAR_COLORS[(user?.id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  if (user?.profile_photo) {
    return (
      <Image
        source={{ uri: getProfileImage(user.profile_photo) }}
        style={[styles.contactAvatar, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}
      />
    );
  }
  return (
    <View style={[styles.contactAvatarFallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.contactAvatarInitial, { color, fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Outgoing SOS card — my SOS session
// ---------------------------------------------------------------------------
const OutgoingCard = ({ item, onCancel, onResolve }) => {
  const status = item.status ?? 'active';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const isActive = status === 'active';

  const notifications = item.notifications ?? [];
  const respondedCount = item.numberofResponded ?? 0;
  const onWayCount = item.numberOnTheWay ?? 0;
  const pendingCount = notifications.filter(n => n.response_status === 'pending').length;

  return (
    <View style={[styles.card, { borderColor: cfg.color + '30' }]}>

      {/* ── Top row: badge + status pill ── */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          {isActive && <PulseDot color={cfg.color} />}
          <Text style={[styles.badgeText, { color: cfg.color }]}>MY SOS ALERT #{item.id}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '40' }]}>
          <Icon name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* ── Meta ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon name="clock-outline" size={12} color="#6B7C99" />
          <Text style={styles.metaText}>{formatTime(item.created_at)}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Icon name="bell-ring-outline" size={12} color="#6B7C99" />
          <Text style={styles.metaText}>Trigger #{item.number_of_trigger ?? 1}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Response stats ── */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#FACC15' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#4A9EFF' }]}>{respondedCount}</Text>
          <Text style={styles.statLabel}>Responded</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#4ADE80' }]}>{onWayCount}</Text>
          <Text style={styles.statLabel}>On the way</Text>
        </View>
      </View>

      {/* ── Notified contacts ── */}
      {notifications.length > 0 && (
        <View style={styles.contactsSection}>
          <View style={styles.divider} />
          <Text style={styles.contactsLabel}>Alerted contacts</Text>
          {notifications.map(n => {
            const rCfg =
              n.response_status === 'accepted'  ? { color: '#4ADE80', icon: 'check-circle' } :
              n.response_status === 'on_the_way' ? { color: '#4A9EFF', icon: 'navigation' } :
                                                   { color: '#FACC15', icon: 'clock-outline' };
            return (
              <View key={n.id} style={styles.contactRow}>
                <ContactAvatar user={n.to_user} size={34} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName} numberOfLines={1}>{n.to_user?.name ?? 'Unknown'}</Text>
                  <Text style={styles.contactPhone}>{n.to_user?.phone_number ?? ''}</Text>
                </View>
                <View style={[styles.responseBadge, { backgroundColor: rCfg.color + '18', borderColor: rCfg.color + '40' }]}>
                  <Icon name={rCfg.icon} size={11} color={rCfg.color} />
                  <Text style={[styles.responseBadgeText, { color: rCfg.color }]}>
                    {n.response_status?.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Action buttons (active only) ── */}
      {isActive && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel?.(item)} activeOpacity={0.7}>
              <Icon name="close-circle-outline" size={15} color="#F87171" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resolveBtn} onPress={() => onResolve?.(item)} activeOpacity={0.7}>
              <Icon name="check-circle-outline" size={15} color="#4ADE80" />
              <Text style={styles.resolveBtnText}>Resolved</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

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
  // stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6B7C99',
    fontSize: 11,
  },
  // contacts
  contactsSection: {
    gap: 10,
  },
  contactsLabel: {
    color: '#6B7C99',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactAvatar: {
    borderWidth: 1.5,
  },
  contactAvatarFallback: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarInitial: {
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: '#D1D9E6',
    fontSize: 13,
    fontWeight: '600',
  },
  contactPhone: {
    color: '#6B7C99',
    fontSize: 11,
  },
  responseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  responseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // actions
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
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
  cancelBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
  },
  resolveBtn: {
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
  resolveBtnText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default OutgoingCard;
