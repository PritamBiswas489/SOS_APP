import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { useListenerMediaSoup } from '../../context/ListenerMediaSoupContext';
import AudioVisualizer from '../../components/audioVisualizer';
import AudioAvatarList from '../../components/audioAvatarList';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#0d0d0f',
  surface:  '#17171a',
  surface2: '#1f1f24',
  border:   '#2a2a30',
  text:     '#e8e8ed',
  muted:    '#6b6b7a',
  accent:   '#7c6ff7',
  red:      '#ef4444',
  green:    '#22c55e',
  amber:    '#f59e0b',
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  idle:       { label: 'IDLE',        dotColor: C.border,  badgeColor: C.muted,  badgeBg: C.surface2 },
  connecting: { label: 'CONNECTING',  dotColor: C.accent,  badgeColor: C.accent, badgeBg: 'rgba(124,111,247,.15)' },
  listening:  { label: '● LISTENING', dotColor: C.green,   badgeColor: C.green,  badgeBg: 'rgba(34,197,94,.15)' },
  waiting:    { label: 'WAITING',     dotColor: C.amber,   badgeColor: C.amber,  badgeBg: 'rgba(245,158,11,.15)' },
  error:      { label: 'ERROR',       dotColor: C.red,     badgeColor: C.red,    badgeBg: 'rgba(239,68,68,.15)' },
};

const AVATAR_COLORS = ['#2F6BFF','#FF3B5C','#2ED573','#FFA726','#6A4CFF','#00BCD4','#8BC34A','#E91E63'];
const getAvatarColor = id => {
  let hash = 0;
  const key = String(id ?? '');
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── RTCView (optional) ───────────────────────────────────────────────────────
let RTCView;
try { RTCView = require('react-native-webrtc').RTCView; } catch (_) { RTCView = null; }

// ─── Component ────────────────────────────────────────────────────────────────
const AudioStreamScreen = () => {
  const { isConnected }      = useSocket();
  const selectedContact      = useSelector(state => state.audioSelectedContact);
  const {
    status, statusText,
    remoteStream, joinRoom, leaveRoom,
  } = useListenerMediaSoup();

  const prevContactIdRef = useRef(null);
  const spinAnim         = useRef(new Animated.Value(0)).current;
  const pulseAnim        = useRef(new Animated.Value(1)).current;
  const panelAnim        = useRef(new Animated.Value(0)).current;

  const cfg         = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const isInRoom    = status !== 'idle' && status !== 'error';
  const isListening = status === 'listening';
  const hasContact  = !!selectedContact?.id;

  // ── Connecting spin animation ──────────────────────────────────────────────
  useEffect(() => {
    if (status === 'connecting') {
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ).start();
    } else {
      spinAnim.stopAnimation(() => spinAnim.setValue(0));
    }
  }, [status]);

  // ── Listening pulse ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 900, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation(() => pulseAnim.setValue(1));
    }
  }, [isListening]);

  // ── Panel slide-in ─────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(panelAnim, {
      toValue:  hasContact ? 1 : 0,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [hasContact]);

  // ── Auto switch room when selected contact changes ────────────────────────
  useEffect(() => {
    const newId = selectedContact?.id;
    if (!newId || newId === prevContactIdRef.current) return;

    const switchRoom = async () => {
       
      if (isInRoom) {
        console.log('Leaving room for previous contact...');
        leaveRoom();
        await new Promise(r => setTimeout(r, 300));
      }
      if (isConnected) {
        console.log('Joining room for new contact...');
        console.log(`Joining room123: sos-live-${selectedContact.receipent_id}`);
        joinRoom(`sos-live-${selectedContact.receipent_id}`);
      }
      prevContactIdRef.current = newId;
    };

    switchRoom();
  }, [selectedContact?.id]);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    leaveRoom();
    prevContactIdRef.current = null;
  }, [leaveRoom]);

  // ── Retry (reconnect same contact) ────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (!selectedContact || !isConnected) return;
   
    console.log(`Joining room4444: sos-live-${selectedContact.receipent_id}`);
    joinRoom(`sos-live-${selectedContact.receipent_id}`);
  }, [selectedContact, isConnected, joinRoom]);

  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const panelMaxH  = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] });
  const panelOpacity = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <SafeAreaView style={ls.safe}>
      <ScrollView
        style={ls.scroll}
        contentContainerStyle={ls.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        

        {/* ── Contacts strip (AudioAvatarList handles selection → audioSelectedContact redux) ── */}
         
        <AudioAvatarList />

        {/* ── Main panel (shown after contact selected) ── */}
        <Animated.View style={[ls.mainPanel, { opacity: panelOpacity, maxHeight: panelMaxH }]}>

          {selectedContact && (
            <>
              {/* Selected contact hero */}
              <View style={ls.heroCard}>
                <Animated.View style={[ls.heroAvatarRing, {
                  transform: [{ scale: pulseAnim }],
                  borderColor: isListening ? C.green : cfg.dotColor,
                  opacity: isListening ? 0.6 : 0.25,
                }]} />
                {selectedContact.profile_image ? (
                  <Image source={{ uri: selectedContact.profile_image }} style={ls.heroAvatar} />
                ) : (
                  <View style={[ls.heroAvatarFallback, { backgroundColor: getAvatarColor(selectedContact.id) }]}>
                    <Text style={ls.heroInitial}>{selectedContact.initial}</Text>
                  </View>
                )}
                <View style={ls.heroInfo}>
                  <Text style={ls.heroName}>{selectedContact.name}</Text>
                  <Text style={ls.heroPhone}>{selectedContact.phone_number ?? ''}</Text>
                  <View style={ls.heroStatusRow}>
                    <View style={[ls.heroDot, { backgroundColor: selectedContact.isOnline ? C.green : C.muted }]} />
                    <Text style={[ls.heroOnlineText, { color: selectedContact.isOnline ? C.green : C.muted }]}>
                      {selectedContact.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status card */}
              <View style={ls.statusCard}>
                {status === 'connecting' ? (
                  <Animated.View style={{ transform: [{ rotate: spinRotate }] }}>
                    <Icon name="sync" size={18} color={C.accent} />
                  </Animated.View>
                ) : (
                  <View style={[ls.statusDot, { backgroundColor: cfg.dotColor }]} />
                )}
                <View style={ls.statusInfo}>
                  <Text style={ls.statusValue}>{statusText}</Text>
                </View>
                 
              </View>

              {/* Audio visualizer */}
              <AudioVisualizer
                key={selectedContact?.id}
                active={isListening}
                color={C.green}
                label="Received Audio"
                height={56}
              />

              {/* Hidden RTCView for audio pipeline */}
              {RTCView && remoteStream && (
                <RTCView
                  streamURL={remoteStream.toURL()}
                  style={ls.rtcHidden}
                  objectFit="cover"
                />
              )}

              {/* Waiting hint */}
              {status === 'waiting' && (
                <View style={ls.waitingHint}>
                  <Icon name="hourglass-empty" size={14} color={C.amber} />
                  <Text style={ls.waitingText}>
                    Waiting for {selectedContact.name} to start an SOS stream…
                  </Text>
                </View>
              )}

              {/* Error hint */}
              {status === 'error' && (
                <View style={ls.errorCard}>
                   
                   
                  <TouchableOpacity style={ls.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
                    <Icon name="refresh" size={14} color={C.red} />
                    <Text style={ls.retryText}>Tap to retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action row */}
              <View style={ls.actionRow}>
                {status === 'idle' ? (
                  <TouchableOpacity
                    style={ls.connectBtn}
                    onPress={handleRetry}
                    activeOpacity={0.8}
                    disabled={!isConnected}
                  >
                    <Icon name="headset" size={15} color="#fff" />
                    <Text style={ls.connectText}>CONNECT</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={ls.disconnectBtn}
                    onPress={handleDisconnect}
                    activeOpacity={0.8}
                  >
                    <Icon name="stop-circle" size={15} color="#fff" />
                    <Text style={ls.disconnectText}>DISCONNECT</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Animated.View>

        {/* ── Idle placeholder ── */}
        {!hasContact && (
          <View style={ls.idlePlaceholder}>
            <View style={ls.idleIconWrap}>
              <Icon name="headset" size={38} color={C.muted} />
            </View>
            <Text style={ls.idleTitle}>No contact selected</Text>
            <Text style={ls.idleSubtitle}>
              Tap a trusted contact above to start listening to their SOS stream
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default AudioStreamScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const ls = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  scroll:       { flex: 1 },
  scrollContent:{ padding: 16, gap: 16 },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:  { fontSize: 22, fontWeight: '700', color: C.text },
  headerSub:    { fontSize: 12, color: C.muted, marginTop: 2 },
  socketPill:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  socketDot:    { width: 7, height: 7, borderRadius: 4 },
  socketPillText:{ fontSize: 11, fontWeight: '600' },

  // Section header
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8, flex: 1 },

  // Main panel
  mainPanel:    { overflow: 'hidden', gap: 12 },

  // Hero card
  heroCard:     { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroAvatarRing:{ position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, left: 13 },
  heroAvatar:   { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: C.border },
  heroAvatarFallback:{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  heroInitial:  { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroInfo:     { flex: 1 },
  heroName:     { fontSize: 17, fontWeight: '700', color: C.text },
  heroPhone:    { fontSize: 12, color: C.muted, marginTop: 2 },
  heroStatusRow:{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  heroDot:      { width: 7, height: 7, borderRadius: 4 },
  heroOnlineText:{ fontSize: 11, fontWeight: '600' },

  // Status card
  statusCard:   { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot:    { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  statusInfo:   { flex: 1 },
  statusValue:  { fontSize: 13, fontWeight: '600', color: C.text },
  badge:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },

  // Waiting / error hints
  waitingHint:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 12 },
  waitingText:  { flex: 1, fontSize: 12, color: C.amber },
  errorCard:    { backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', padding: 14, gap: 8 },
  errorHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTitle:   { fontSize: 10, fontWeight: '800', color: C.red, letterSpacing: 0.8 },
  errorMessage: { fontSize: 13, color: '#f87171', lineHeight: 20 },
  retryBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 12, paddingVertical: 8 },
  retryText:    { fontSize: 12, color: C.red, fontWeight: '700' },

  // Action row
  actionRow:    { flexDirection: 'row', gap: 10 },
  connectBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: 10, backgroundColor: C.accent },
  connectText:  { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  disconnectBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: 10, backgroundColor: C.red },
  disconnectText:{ fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

  // RTCView hidden
  rtcHidden:    { position: 'absolute', width: 1, height: 1, opacity: 0 },

  // Idle placeholder
  idlePlaceholder:{ alignItems: 'center', paddingVertical: 50, gap: 12 },
  idleIconWrap:   { width: 80, height: 80, borderRadius: 40, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  idleTitle:      { fontSize: 16, fontWeight: '700', color: C.text },
  idleSubtitle:   { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
