import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------
export const DUMMY_INCOMING_SOS = [
  {
    id: 'in1',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-7890',
    avatar: null,
    initials: 'SJ',
    location: 'Times Square, New York',
    time: '2 min ago',
    status: 'Active',
  },
  {
    id: 'in2',
    name: 'Michael Torres',
    phone: '+1 (555) 876-3421',
    avatar: null,
    initials: 'MT',
    location: 'Central Park, New York',
    time: '5 min ago',
    status: 'Active',
  },
  {
    id: 'in3',
    name: 'Emily Chen',
    phone: '+1 (555) 543-9812',
    avatar: null,
    initials: 'EC',
    location: 'Brooklyn Bridge, New York',
    time: '8 min ago',
    status: 'Pending',
  },
];

export const DUMMY_OUTGOING_SOS = [
  {
    id: 'out1',
    name: 'David Williams',
    phone: '+1 (555) 112-6543',
    avatar: null,
    initials: 'DW',
    location: 'Manhattan Ave, New York',
    time: '3 min ago',
    respondedBy: 2,
  },
  {
    id: 'out2',
    name: 'Contact Group B',
    phone: '+1 (555) 789-0012',
    avatar: null,
    initials: 'CB',
    location: 'Queens Blvd, New York',
    time: '10 min ago',
    respondedBy: 0,
  },
];

// Legacy export kept for backward compat with App.jsx
export const DUMMY_SOS_VICTIMS = DUMMY_INCOMING_SOS;

// ---------------------------------------------------------------------------
// Pulsing dot
// ---------------------------------------------------------------------------
const PulseDot = ({ color = '#FF3B5C' }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.7, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, scale]);

  return (
    <View style={styles.pulseWrapper}>
      <Animated.View style={[styles.pulseRing, { backgroundColor: color, transform: [{ scale }], opacity }]} />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
const Avatar = ({ item, borderColor }) => {
  const avatarColors = ['#FF3B5C', '#4A9EFF', '#00FF9C', '#FFA502', '#A855F7'];
  const color = avatarColors[item.id.charCodeAt(0) % avatarColors.length];
  const bc = borderColor || color;

  if (item.avatar) {
    return <Image source={{ uri: item.avatar }} style={[styles.avatar, { borderColor: bc }]} />;
  }
  return (
    <View style={[styles.avatarFallback, { backgroundColor: color + '22', borderColor: bc }]}>
      <Text style={[styles.avatarInitials, { color }]}>{item.initials}</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Incoming SOS card — responder sees victim, can chat / stream / map
// ---------------------------------------------------------------------------
const IncomingCard = ({ item, onChat, onAudio, onMap }) => {
  const isActive = item.status === 'Active';

  return (
    <View style={[styles.card, isActive && styles.cardIncomingActive]}>
      {/* Badge row */}
      <View style={styles.cardBadgeRow}>
        <PulseDot color="#FF3B5C" />
        <Text style={styles.badgeTextRed}>INCOMING SOS</Text>
        <View style={[styles.statusPill, { backgroundColor: isActive ? 'rgba(255,59,92,0.15)' : 'rgba(255,165,2,0.12)' }]}>
          <Text style={[styles.statusPillText, { color: isActive ? '#FF3B5C' : '#FFA502' }]}>{item.status}</Text>
        </View>
      </View>

      {/* Profile */}
      <View style={styles.profileRow}>
        <Avatar item={item} borderColor="#FF3B5C" />
        <View style={styles.profileInfo}>
          <Text style={styles.victimName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="phone" size={12} color="#6B7C99" />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={12} color="#6B7C99" />
            <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onChat?.(item)} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconChat]}>
            <Icon name="chat-outline" size={20} color="#4A9EFF" />
          </View>
          <Text style={[styles.actionLabel, { color: '#4A9EFF' }]}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => onAudio?.(item)} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconAudio]}>
            <Icon name="waveform" size={20} color="#00FF9C" />
          </View>
          <Text style={[styles.actionLabel, { color: '#00FF9C' }]}>Stream</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => onMap?.(item)} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconMap]}>
            <Icon name="map-outline" size={20} color="#FFA502" />
          </View>
          <Text style={[styles.actionLabel, { color: '#FFA502' }]}>Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Outgoing SOS card — sender sees who they alerted and how many responded
// ---------------------------------------------------------------------------
const OutgoingCard = ({ item, onCancel }) => {
  const hasResponders = item.respondedBy > 0;

  return (
    <View style={[styles.card, styles.cardOutgoing]}>
      {/* Badge row */}
      <View style={styles.cardBadgeRow}>
        <PulseDot color="#4A9EFF" />
        <Text style={styles.badgeTextBlue}>OUTGOING SOS</Text>
        <View style={[styles.statusPill, { backgroundColor: hasResponders ? 'rgba(0,255,156,0.1)' : 'rgba(255,165,2,0.1)' }]}>
          <Text style={[styles.statusPillText, { color: hasResponders ? '#00FF9C' : '#FFA502' }]}>
            {hasResponders ? `${item.respondedBy} Responded` : 'Awaiting'}
          </Text>
        </View>
      </View>

      {/* Profile */}
      <View style={styles.profileRow}>
        <Avatar item={item} borderColor="#4A9EFF" />
        <View style={styles.profileInfo}>
          <Text style={styles.victimName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="phone" size={12} color="#6B7C99" />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={12} color="#6B7C99" />
            <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
          </View>
          <Text style={[styles.timeText, { color: 'rgba(74,158,255,0.7)' }]}>{item.time}</Text>
        </View>
      </View>

      {/* Responder info */}
      {hasResponders && (
        <View style={styles.responderInfo}>
          <Icon name="account-check-outline" size={14} color="#00FF9C" />
          <Text style={styles.responderText}>
            {item.respondedBy} contact{item.respondedBy > 1 ? 's are' : ' is'} on the way
          </Text>
        </View>
      )}

      <View style={styles.cardDivider} />

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel?.(item)} activeOpacity={0.7}>
        <Icon name="close-circle-outline" size={18} color="#FF3B5C" />
        <Text style={styles.cancelBtnText}>Cancel SOS Alert</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Animated tab bar
// ---------------------------------------------------------------------------
const TabBar = ({ activeTab, incomingCount, outgoingCount, onSelect }) => {
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: activeTab === 'incoming' ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [activeTab, indicatorAnim]);

  const indicatorLeft = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
        <TouchableOpacity style={styles.tabBtn} onPress={() => onSelect('incoming')} activeOpacity={0.8}>
          <Icon name="arrow-down-circle-outline" size={15} color={activeTab === 'incoming' ? '#FF3B5C' : '#6B7C99'} />
          <Text style={[styles.tabLabel, activeTab === 'incoming' && styles.tabLabelActive]}>
            Incoming SOS
          </Text>
          {incomingCount > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: '#FF3B5C' }]}>
              <Text style={styles.tabBadgeText}>{incomingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => onSelect('outgoing')} activeOpacity={0.8}>
          <Icon name="arrow-up-circle-outline" size={15} color={activeTab === 'outgoing' ? '#4A9EFF' : '#6B7C99'} />
          <Text style={[styles.tabLabel, activeTab === 'outgoing' && styles.tabLabelOutgoingActive]}>
            Outgoing SOS
          </Text>
          {outgoingCount > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: '#4A9EFF' }]}>
              <Text style={styles.tabBadgeText}>{outgoingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
const SOSAlertModal = ({
  visible = false,
  incomingVictims = DUMMY_INCOMING_SOS,
  outgoingVictims = DUMMY_OUTGOING_SOS,
  victims, // legacy prop — maps to incomingVictims
  onClose,
  onChat,
  onAudio,
  onMap,
  onCancelSOS,
}) => {
  const incoming = victims || incomingVictims;

  const [activeTab, setActiveTab] = useState('incoming');
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setActiveTab('incoming');
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(60);
      opacityAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim]);

  const isIncoming = activeTab === 'incoming';
  const activeList = isIncoming ? incoming : outgoingVictims;
  const totalCount = incoming.length + outgoingVictims.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
          ]}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.sosBadge}>
                <Icon name="alert-circle" size={18} color="#FF3B5C" />
                <Text style={styles.sosBadgeText}>SOS ALERT</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {totalCount} active alert{totalCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={20} color="#6B7C99" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <TabBar
            activeTab={activeTab}
            incomingCount={incoming.length}
            outgoingCount={outgoingVictims.length}
            onSelect={setActiveTab}
          />

          {/* Alert strip */}
          <View style={[styles.alertStrip, !isIncoming && styles.alertStripBlue]}>
            <Icon
              name={isIncoming ? 'shield-alert-outline' : 'send-circle-outline'}
              size={14}
              color={isIncoming ? '#FF3B5C' : '#4A9EFF'}
            />
            <Text style={[styles.alertStripText, !isIncoming && { color: '#4A9EFF' }]}>
              {isIncoming
                ? 'Emergency response required — tap an action to respond'
                : 'Your SOS alerts — track responses from your trusted contacts'}
            </Text>
          </View>

          {/* Scrollable list */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {activeList.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name={isIncoming ? 'shield-check-outline' : 'bell-off-outline'}
                  size={48}
                  color="rgba(107,124,153,0.3)"
                />
                <Text style={styles.emptyText}>
                  {isIncoming ? 'No incoming SOS alerts' : 'No outgoing SOS alerts'}
                </Text>
              </View>
            ) : (
              activeList.map(item =>
                isIncoming ? (
                  <IncomingCard
                    key={item.id}
                    item={item}
                    onChat={onChat}
                    onAudio={onAudio}
                    onMap={onMap}
                  />
                ) : (
                  <OutgoingCard
                    key={item.id}
                    item={item}
                    onCancel={onCancelSOS}
                  />
                ),
              )
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.dismissText}>Dismiss All Alerts</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 11, 27, 0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0E1A33',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.2)',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sosBadgeText: {
    color: '#FF3B5C',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#6B7C99',
    fontSize: 13,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab bar
  tabBarWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#071022',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: '#0E1A33',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7C99',
  },
  tabLabelActive: {
    color: '#FF3B5C',
  },
  tabLabelOutgoingActive: {
    color: '#4A9EFF',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Alert strip
  alertStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,59,92,0.07)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,59,92,0.13)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 12,
  },
  alertStripBlue: {
    backgroundColor: 'rgba(74,158,255,0.07)',
    borderColor: 'rgba(74,158,255,0.13)',
  },
  alertStripText: {
    color: '#FF3B5C',
    fontSize: 11,
    flex: 1,
    opacity: 0.85,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: 'rgba(107,124,153,0.5)',
    fontSize: 14,
  },

  // Card base
  card: {
    backgroundColor: '#071022',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
  },
  cardIncomingActive: {
    borderColor: 'rgba(255,59,92,0.18)',
  },
  cardOutgoing: {
    borderColor: 'rgba(74,158,255,0.18)',
  },

  // Card badge row
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  badgeTextRed: {
    color: '#FF3B5C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    flex: 1,
  },
  badgeTextBlue: {
    color: '#4A9EFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    flex: 1,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  victimName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    color: '#6B7C99',
    fontSize: 12,
    flex: 1,
  },
  timeText: {
    color: 'rgba(255,59,92,0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Responder info (outgoing)
  responderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,255,156,0.07)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
  },
  responderText: {
    color: '#00FF9C',
    fontSize: 12,
    fontWeight: '600',
  },

  // Card divider
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },

  // Actions (incoming)
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
  actionIconChat: { backgroundColor: 'rgba(74,158,255,0.12)' },
  actionIconAudio: { backgroundColor: 'rgba(0,255,156,0.1)' },
  actionIconMap: { backgroundColor: 'rgba(255,165,2,0.1)' },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Cancel button (outgoing)
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,59,92,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.2)',
  },
  cancelBtnText: {
    color: '#FF3B5C',
    fontSize: 13,
    fontWeight: '700',
  },

  // Pulse
  pulseWrapper: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.4,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Footer
  dismissBtn: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,59,92,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.25)',
    alignItems: 'center',
  },
  dismissText: {
    color: '#FF3B5C',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SOSAlertModal;
