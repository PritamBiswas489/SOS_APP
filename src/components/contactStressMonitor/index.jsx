/**
 * ContactStressMonitor
 * Shows a selected contact's stress score, BPM, HRV and breakdown.
 * ── Static data is used now; swap TODO sections for real API/socket data later.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

// ─────────────────────────────────────────────
// STATIC PLACEHOLDER DATA  (replace with props / selector later)
// ─────────────────────────────────────────────
const STATIC_CONTACT = {
  name: 'Sarah Johnson',
  phone_number: '+1 (555) 012‑3456',
  profile_image: null,        // TODO: replace with contact.profile_image
  initial: 'S',
};

const STATIC_STRESS = {
  score: 62,                  // TODO: replace with live score
  label: 'Moderate',          // TODO: derive from score
  emoji: '😐',               // TODO: derive from score
  color: '#FFD166',           // TODO: derive from score
  level: 2,                   // 0–4
};

const STATIC_METRICS = {
  bpm: 88,                    // TODO: replace with contact live BPM
  avgBpm: 74,                 // TODO: replace with contact avg BPM
  rmssd: 28,                  // TODO: replace with contact HRV
  hrIntensity: 55,            // TODO: replace (%)
  lastUpdated: '2 min ago',   // TODO: replace with real timestamp
  isLive: false,              // TODO: true when receiving real-time data
};

const STATIC_BREAKDOWN = {
  hrScore: 26,                // TODO: replace with real HR sub-score  (max 40)
  rmssdScore: 17,             // TODO: replace with real HRV sub-score (max 30)
};

const STRESS_TIPS = {
  Relaxed:  'Your contact is calm and balanced. No action needed.',
  Low:      'Mild tension. A quick check-in message might be nice.',
  Moderate: 'Stress is building — consider reaching out.',
  High:     'Elevated stress detected. Recommend contacting them soon.',
  Critical: 'Critical level — contact them immediately or send SOS.',
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ContactAvatar({ contact, stressColor }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.avatarOuter, { transform: [{ scale: pulseAnim }], shadowColor: stressColor }]}>
      <View style={[styles.avatarRing, { borderColor: stressColor }]}>
        {contact.profile_image ? (
          <Image source={{ uri: contact.profile_image }} style={styles.avatarImg} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: stressColor + '22' }]}>
            <Text style={[styles.avatarInitial, { color: stressColor }]}>
              {contact.initial || contact.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function StressGauge({ score, state }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 100,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  return (
    <View style={styles.gaugeWrap}>
      <View style={[styles.gaugeOuter, { shadowColor: state.color }]}>
        <View style={[styles.gaugeRing, { borderColor: state.color, shadowColor: state.color }]} />
        <View style={styles.gaugeInner}>
          <Text style={styles.gaugeEmoji}>{state.emoji}</Text>
          <Text style={[styles.gaugeScore, { color: state.color }]}>{score}</Text>
          <Text style={[styles.gaugeStateLabel, { color: state.color }]}>{state.label}</Text>
          <Text style={styles.gaugeSubLabel}>Stress Index</Text>
        </View>
      </View>
    </View>
  );
}

function BpmHero({ bpm, avgBpm, stressColor, isLive, lastUpdated }) {
  const dotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isLive]);

  return (
    <View style={styles.bpmHero}>
      <View style={styles.bpmHeroLeft}>
        <Text style={styles.bpmHeroLabel}>Heart Rate</Text>
        <View style={styles.bpmValRow}>
          <Text style={[styles.bpmVal, { color: stressColor }]}>{bpm ?? '––'}</Text>
          <Text style={styles.bpmUnit}>bpm</Text>
        </View>
        <Text style={styles.bpmMeta}>
          Avg {avgBpm || '–'} bpm  ·  {lastUpdated}
        </Text>
      </View>

      <View style={styles.bpmHeroRight}>
        {isLive && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={[styles.bpmPulseRing, { borderColor: stressColor + '60' }]}>
          <Text style={styles.bpmPulseIcon}>🫀</Text>
        </View>
      </View>
    </View>
  );
}

function MetricCard({ icon, label, value, unit, color = '#A0AEC0', sub }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.metricIcon}>{icon}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>
        {value ?? '–'}
        {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {sub ? <Text style={[styles.metricSub, { color }]}>{sub}</Text> : null}
    </View>
  );
}

function BreakdownBar({ label, score, max, color, icon }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(100, (score / max) * 100);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.barRow}>
      <View style={[styles.barIconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.barIcon}>{icon}</Text>
      </View>
      <View style={styles.barContent}>
        <View style={styles.barTopRow}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={[styles.barScore, { color }]}>
            {score}<Text style={styles.barMax}>/{max}</Text>
          </Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View
            style={[styles.barFill, {
              width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: color,
            }]}
          />
        </View>
        <Text style={[styles.barPct, { color: color + 'AA' }]}>{Math.round(pct)}% of max</Text>
      </View>
    </View>
  );
}

function StatusBanner({ level, stressColor, label }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (level >= 3) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1,   duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      opacity.setValue(1);
    }
  }, [level]);

  if (level < 2) return null;

  return (
    <Animated.View style={[styles.banner, { opacity, borderColor: stressColor, backgroundColor: stressColor + '10' }]}>
      <Text style={styles.bannerIcon}>{level >= 3 ? '⚠️' : 'ℹ️'}</Text>
      <Text style={[styles.bannerText, { color: stressColor }]}>
        {level >= 3 ? `${label} Stress — Consider reaching out` : `${label} Stress — Monitoring closely`}
      </Text>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function ContactStressMonitor({
  // TODO: pass these props from the parent screen when real data is available
  contact = STATIC_CONTACT,
  stress  = STATIC_STRESS,
  metrics = STATIC_METRICS,
  breakdown = STATIC_BREAKDOWN,
}) {
  const hrvColor  = metrics.rmssd > 40 ? '#00E5A0' : metrics.rmssd > 20 ? '#FFD166' : '#FF3366';
  const zoneColor = metrics.hrIntensity > 70 ? '#FF3366' : metrics.hrIntensity > 50 ? '#FFD166' : '#00E5A0';
return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Contact Header ── */}
      <View style={styles.contactHeader}>
        <ContactAvatar contact={contact} stressColor={stress.color} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
          {contact.phone_number ? (
            <Text style={styles.contactPhone}>{contact.phone_number}</Text>
          ) : null}
          <View style={[styles.stressLevelPill, { backgroundColor: stress.color + '18', borderColor: stress.color + '40' }]}>
            <Text style={[styles.stressLevelText, { color: stress.color }]}>
              {stress.emoji}  {stress.label}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Alert Banner ── */}
      <StatusBanner level={stress.level} stressColor={stress.color} label={stress.label} />

      {/* ── Stress Gauge ── */}
      <StressGauge score={stress.score} state={stress} />

      {/* ── BPM Hero ── */}
      <BpmHero
        bpm={metrics.bpm}
        avgBpm={metrics.avgBpm}
        stressColor={stress.color}
        isLive={metrics.isLive}
        lastUpdated={metrics.lastUpdated}
      />

      {/* ── HRV & Zone Metrics ── */}
      <View style={styles.grid}>
        <MetricCard
          icon="💓"
          label="HRV · RMSSD"
          value={metrics.rmssd}
          unit="ms"
          color={hrvColor}
          sub={metrics.rmssd > 40 ? 'Good' : metrics.rmssd > 20 ? 'Moderate' : 'Low'}
        />
        <MetricCard
          icon="⚡"
          label="HR Zone"
          value={metrics.hrIntensity}
          unit="%"
          color={zoneColor}
          sub={metrics.hrIntensity > 70 ? 'High' : metrics.hrIntensity > 50 ? 'Elevated' : 'Normal'}
        />
      </View>

      {/* ── Score Breakdown ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <View style={[styles.scorePill, { backgroundColor: stress.color + '18', borderColor: stress.color + '40' }]}>
            <Text style={[styles.scorePillText, { color: stress.color }]}>{stress.score}/100</Text>
          </View>
        </View>
        <Text style={styles.sectionDesc}>
          How the stress index is calculated from this contact's biometrics.
        </Text>
        <BreakdownBar icon="🫀" label="Heart Rate"   score={breakdown.hrScore}    max={40} color="#FF8C42" />
        <BreakdownBar icon="💓" label="HRV Quality"  score={breakdown.rmssdScore} max={30} color="#5352ED" />
      </View>

      {/* ── Tip ── */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <View style={styles.tipBody}>
          <Text style={styles.tipTitle}>Recommendation</Text>
          <Text style={styles.tipText}>
            {STRESS_TIPS[stress.label] ?? `Keep monitoring this contact's wellbeing.`}
          </Text>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}


// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12 },

  // Contact Header
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0F1A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111827',
    gap: 14,
  },
  avatarOuter: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 26, fontWeight: '900' },
  contactInfo:   { flex: 1 },
  contactName:   { fontSize: 17, fontWeight: '800', color: '#E8EDF5', marginBottom: 2 },
  contactPhone:  { fontSize: 11, color: '#3D4E6A', marginBottom: 7 },
  stressLevelPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stressLevelText: { fontSize: 12, fontWeight: '700' },

  // Alert Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginBottom: 9,
    gap: 7,
  },
  bannerIcon: { fontSize: 14 },
  bannerText: { fontWeight: '700', fontSize: 12, letterSpacing: 0.4, flex: 1 },

  // Gauge
  gaugeWrap:      { alignItems: 'center', marginVertical: 10 },
  gaugeOuter: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0F1A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 10,
  },
  gaugeRing: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  gaugeInner:     { alignItems: 'center' },
  gaugeEmoji:     { fontSize: 26, marginBottom: 2 },
  gaugeScore:     { fontSize: 46, fontWeight: '900', lineHeight: 52 },
  gaugeStateLabel:{ fontSize: 13, fontWeight: '700', color: '#E8EDF5', marginTop: 1 },
  gaugeSubLabel:  { fontSize: 9, color: '#3D4E6A', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 },

  // BPM Hero
  bpmHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C0F1A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111827',
  },
  bpmHeroLeft:  { flex: 1 },
  bpmHeroLabel: { fontSize: 10, color: '#3D4E6A', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 },
  bpmValRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bpmVal:       { fontSize: 50, fontWeight: '900', lineHeight: 54 },
  bpmUnit:      { fontSize: 15, color: '#3D4E6A', fontWeight: '600', marginBottom: 6 },
  bpmMeta:      { fontSize: 11, color: '#3D4E6A', marginTop: 3 },
  bpmHeroRight: { paddingLeft: 12, alignItems: 'center', gap: 8 },
  bpmPulseRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  bpmPulseIcon: { fontSize: 24 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5A012',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#00E5A030',
    gap: 4,
  },
  liveDot:  { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00E5A0' },
  liveText: { fontSize: 8, color: '#00E5A0', fontWeight: '800', letterSpacing: 1 },

  // Metric Grid
  grid:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: '#0C0F1A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#111827',
    alignItems: 'center',
  },
  metricIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  metricIcon:  { fontSize: 18 },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricUnit:  { fontSize: 11, color: '#3D4E6A', fontWeight: '400' },
  metricLabel: { fontSize: 9, color: '#3D4E6A', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  metricSub:   { fontSize: 10, fontWeight: '600', marginTop: 3 },

  // Section
  section: {
    backgroundColor: '#0C0F1A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111827',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: '#E8EDF5', letterSpacing: 0.3 },
  sectionDesc:   { fontSize: 11, color: '#3D4E6A', marginBottom: 11, lineHeight: 17 },
  scorePill:     { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  scorePillText: { fontSize: 11, fontWeight: '800' },

  // Breakdown Bars
  barRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 11, gap: 10 },
  barIconWrap:{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barIcon:    { fontSize: 15 },
  barContent: { flex: 1 },
  barTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  barLabel:   { fontSize: 12, color: '#E8EDF5', fontWeight: '600' },
  barTrack:   { height: 5, backgroundColor: '#1A2235', borderRadius: 3, overflow: 'hidden' },
  barFill:    { height: 5, borderRadius: 3 },
  barScore:   { fontSize: 12, fontWeight: '800' },
  barMax:     { fontSize: 10, color: '#3D4E6A', fontWeight: '400' },
  barPct:     { fontSize: 9, marginTop: 4, letterSpacing: 0.3 },

  // Tip
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#0C0F1A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111827',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipIcon:  { fontSize: 20, marginTop: 2 },
  tipBody:  { flex: 1 },
  tipTitle: { fontSize: 12, fontWeight: '700', color: '#E8EDF5', marginBottom: 4 },
  tipText:  { color: '#A0AEC0', fontSize: 12, lineHeight: 18 },
});
