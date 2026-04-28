/**
 * StressMonitorScreen — Health Connect edition
 */

import React, {useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, StatusBar, Platform,
} from 'react-native';
import {useStress, STRESS_STATE} from '../../context/StressContext';
import {useGoogleFit} from '../../context/GoogleFitContext';
import {useBle} from '../../context/BleContext';

// ── Animated Stress Gauge ─────────────────────
function StressGauge({score, state}) {
  const anim      = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 100, duration: 1200,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [score]);

  useEffect(() => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    if (state.level >= 3) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.06, duration: 600, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1,    duration: 600, useNativeDriver: true}),
        ]),
      );
      pulseLoop.current.start();
    }
    return () => pulseLoop.current?.stop();
  }, [state.level]);

  return (
    <Animated.View style={[styles.gaugeWrap, {transform: [{scale: pulseAnim}]}]}>
      <View style={[styles.gaugeOuter, {shadowColor: state.color}]}>
        <View style={[styles.gaugeRing, {borderColor: state.color, shadowColor: state.color}]} />
        <View style={styles.gaugeInner}>
          <Text style={styles.gaugeEmoji}>{state.emoji}</Text>
          <Text style={[styles.gaugeScore, {color: state.color}]}>{score}</Text>
          <Text style={[styles.gaugeStateLabel, {color: state.color}]}>{state.label}</Text>
          <Text style={styles.gaugeSubLabel}>Stress Index</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Metric Card ───────────────────────────────
function MetricCard({icon, label, value, unit, color = '#A0AEC0', sub}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconWrap, {backgroundColor: color + '18'}]}>
        <Text style={styles.metricIcon}>{icon}</Text>
      </View>
      <Text style={[styles.metricValue, {color}]}>
        {value ?? '–'}
        {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {sub ? <Text style={[styles.metricSub, {color}]}>{sub}</Text> : null}
    </View>
  );
}

// ── Breakdown Bar ─────────────────────────────
function BreakdownBar({label, score, max, color, icon}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(100, (score / max) * 100);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct, duration: 900,
      easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.barRow}>
      <View style={[styles.barIconWrap, {backgroundColor: color + '18'}]}>
        <Text style={styles.barIcon}>{icon}</Text>
      </View>
      <View style={styles.barContent}>
        <View style={styles.barTopRow}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={[styles.barScore, {color}]}>
            {score}<Text style={styles.barMax}>/{max}</Text>
          </Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, {
            width: widthAnim.interpolate({inputRange: [0, 100], outputRange: ['0%', '100%']}),
            backgroundColor: color,
          }]} />
        </View>
        <Text style={[styles.barPct, {color: color + 'AA'}]}>{Math.round(pct)}% of max</Text>
      </View>
    </View>
  );
}

// ── Source Badge ──────────────────────────────
function SourceBadge({active, label, icon}) {
  return (
    <View style={[styles.badge, {
      backgroundColor: active ? '#00E5A010' : '#FFFFFF08',
      borderColor:     active ? '#00E5A040' : '#FFFFFF10',
    }]}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <View style={[styles.badgeDot, {backgroundColor: active ? '#00E5A0' : '#3D4E6A'}]} />
      <Text style={[styles.badgeText, {color: active ? '#E8EDF5' : '#3D4E6A'}]}>{label}</Text>
    </View>
  );
}

// ── SOS Banner ────────────────────────────────
function SosBanner({visible, stressState}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const loop    = useRef(null);

  useEffect(() => {
    if (visible) {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {toValue: 1,   duration: 500, useNativeDriver: true}),
          Animated.timing(opacity, {toValue: 0.4, duration: 500, useNativeDriver: true}),
        ]),
      );
      loop.current.start();
    } else {
      loop.current?.stop();
      opacity.setValue(0);
    }
    return () => loop.current?.stop();
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[styles.sosBanner, {opacity, borderColor: stressState.color}]}>
      <Text style={styles.sosBannerIcon}>⚠️</Text>
      <Text style={[styles.sosBannerText, {color: stressState.color}]}>
        {stressState === STRESS_STATE.CRITICAL
          ? 'Critical Stress — SOS Ready'
          : 'High Stress — Monitor Closely'}
      </Text>
    </Animated.View>
  );
}

const TIPS = {
  Relaxed:  "You're in balance. Your nervous system is thriving — keep it up.",
  Low:      'Mild tension detected. A short walk or stretching will keep you stable.',
  Moderate: 'Try box breathing (4‑4‑4‑4) or 5 minutes of mindfulness now.',
  High:     'Step away. Hydrate, breathe deeply, and rest for at least 10 minutes.',
  Critical: 'Critical level — if emergency, use SOS. Sit down, breathe slowly, call someone.',
};

// ── Main Screen ───────────────────────────────
export default function StressMonitorScreen() {
  const {stress, sosArmed, sendSos, dismissSos} = useStress();
  const gf  = useGoogleFit();
  const ble = useBle();

  const displayHR = ble.connected && ble.currentHR ? ble.currentHR : stress.currentHR;
  const hrSource  = ble.connected ? 'Live BLE' : 'Health Connect';

  const hrvColor = stress.rmssd > 40 ? '#00E5A0' : stress.rmssd > 20 ? '#FFD166' : '#FF3366';
  const zoneColor = stress.hrIntensity > 70 ? '#FF3366' : stress.hrIntensity > 50 ? '#FFD166' : '#00E5A0';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#07090F" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Stress Monitor</Text>
          <Text style={styles.headerSub}>Real-time Health Intelligence</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBtn, gf.loading && styles.syncBtnActive]}
          onPress={gf.refresh}
          disabled={gf.loading}>
          <Text style={styles.syncBtnText}>{gf.loading ? '…' : '↻'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Gauge ── */}
        <StressGauge score={stress.score} state={stress.state} />

        {/* ── Alert Banner ── */}
        <SosBanner visible={stress.state.level >= 3} stressState={stress.state} />

        {/* ── SOS Actions ── */}
        {sosArmed && (
          <View style={styles.sosActions}>
            <TouchableOpacity style={styles.sosBtn} onPress={sendSos}>
              <Text style={styles.sosBtnText}>🆘  Send SOS Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissBtn} onPress={dismissSos}>
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Source Status ── */}
        <View style={styles.badgeRow}>
          <SourceBadge active={gf.authorized} label="Health Connect" icon="❤️" />
          <SourceBadge active={ble.connected}  label={ble.connected ? ble.deviceName : 'BLE Device'} icon="📡" />
        </View>

        {/* ── Heart Rate Hero ── */}
        <View style={styles.hrHero}>
          <View style={styles.hrHeroLeft}>
            <Text style={styles.hrHeroLabel}>Heart Rate</Text>
            <View style={styles.hrHeroValRow}>
              <Text style={styles.hrHeroVal}>{displayHR ?? '––'}</Text>
              <Text style={styles.hrHeroUnit}>bpm</Text>
            </View>
            <Text style={styles.hrHeroMeta}>
              <Text style={styles.hrSourceDot}>● </Text>
              {hrSource}  ·  Avg {stress.avgHR || '–'} bpm
            </Text>
          </View>
          <View style={styles.hrHeroRight}>
            <View style={[styles.hrPulseRing, {borderColor: stress.state.color + '60'}]}>
              <Text style={[styles.hrPulseEmoji]}>{stress.state.emoji}</Text>
            </View>
          </View>
        </View>

        {/* ── Metrics ── */}
        <View style={styles.grid}>
          <MetricCard
            icon="💓" label="HRV · RMSSD" value={stress.rmssd} unit="ms"
            color={hrvColor}
            sub={stress.rmssd > 40 ? 'Good' : stress.rmssd > 20 ? 'Moderate' : 'Low'}
          />
          <MetricCard
            icon="⚡" label="HR Zone" value={stress.hrIntensity} unit="%"
            color={zoneColor}
            sub={stress.hrIntensity > 70 ? 'High' : stress.hrIntensity > 50 ? 'Elevated' : 'Normal'}
          />
        </View>

        {/* ── Score Breakdown ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <View style={[styles.scorePill, {backgroundColor: stress.state.color + '18', borderColor: stress.state.color + '40'}]}>
              <Text style={[styles.scorePillText, {color: stress.state.color}]}>{stress.score}/100</Text>
            </View>
          </View>
          <Text style={styles.sectionDesc}>How your stress index is calculated from live biometrics.</Text>
          <BreakdownBar icon="🫀" label="Heart Rate"  score={stress.hrScore}    max={40} color="#FF8C42" />
          <BreakdownBar icon="💓" label="HRV Quality" score={stress.rmssdScore} max={30} color="#5352ED" />
        </View>

        {/* ── BLE Device ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bluetooth HR Device</Text>
            {ble.connected && (
              <View style={styles.connectedPill}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionDesc}>
            Pair any BLE Heart Rate Service (0x180D) — smartwatch or chest strap.
          </Text>
          {ble.error ? <Text style={styles.errorText}>{ble.error}</Text> : null}
          {!ble.connected ? (
            <TouchableOpacity
              style={[styles.btnPrimary, ble.scanning && styles.btnMuted]}
              onPress={ble.startScan}
              disabled={ble.scanning}>
              <Text style={styles.btnText}>{ble.scanning ? '🔍  Scanning…' : '📡  Scan for HR Device'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnDanger} onPress={ble.disconnect}>
              <Text style={styles.btnText}>Disconnect — {ble.deviceName}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Health Connect auth prompt ── */}
        {!gf.authorized && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Health Connect</Text>
              <View style={[styles.connectedPill, {backgroundColor: '#FF336618', borderColor: '#FF336640'}]}>
                <View style={[styles.connectedDot, {backgroundColor: '#FF3366'}]} />
                <Text style={[styles.connectedText, {color: '#FF3366'}]}>Not connected</Text>
              </View>
            </View>
            <Text style={styles.sectionDesc}>
              Grant access to read heart rate from Android Health Connect.
            </Text>
            {gf.error ? <Text style={styles.errorText}>{gf.error}</Text> : null}
            <TouchableOpacity
              style={[styles.btnPrimary, gf.loading && styles.btnMuted]}
              onPress={gf.authorize}
              disabled={gf.loading}>
              <Text style={styles.btnText}>
                {gf.loading ? 'Connecting…' : '🔗  Connect Health Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tip ── */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>Recommendation</Text>
            <Text style={styles.tipText}>{TIPS[stress.state.label] ?? 'Stay hydrated and keep monitoring.'}</Text>
          </View>
        </View>

        <View style={{height: 52}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   {flex: 1, backgroundColor: '#07090F'},

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 54,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#111827',
  },
  headerTitle: {fontSize: 22, fontWeight: '800', color: '#E8EDF5', letterSpacing: 0.3},
  headerSub:   {fontSize: 11, color: '#3D4E6A', marginTop: 3, letterSpacing: 1.4, textTransform: 'uppercase'},
  syncBtn:        {width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E2D45'},
  syncBtnActive:  {borderColor: '#5352ED'},
  syncBtnText:    {color: '#7EB8F7', fontSize: 18, fontWeight: '700'},

  scroll:        {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingTop: 12},

  // Gauge
  gaugeWrap:      {alignItems: 'center', marginVertical: 20},
  gaugeOuter:     {
    width: 220, height: 220, borderRadius: 110,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0C0F1A',
    shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.35, shadowRadius: 30, elevation: 12,
  },
  gaugeRing:      {position: 'absolute', width: 208, height: 208, borderRadius: 104, borderWidth: 5, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 16, elevation: 10},
  gaugeInner:     {alignItems: 'center'},
  gaugeEmoji:     {fontSize: 36, marginBottom: 4},
  gaugeScore:     {fontSize: 58, fontWeight: '900', lineHeight: 64},
  gaugeStateLabel:{fontSize: 15, fontWeight: '700', color: '#E8EDF5', marginTop: 2},
  gaugeSubLabel:  {fontSize: 10, color: '#3D4E6A', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2},

  // SOS Banner
  sosBanner:    {flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#FF336608', gap: 8},
  sosBannerIcon:{fontSize: 16},
  sosBannerText:{fontWeight: '700', fontSize: 13, letterSpacing: 0.4, flex: 1},

  // SOS Actions
  sosActions:    {flexDirection: 'row', gap: 10, marginBottom: 14},
  sosBtn:        {flex: 2, backgroundColor: '#FF3366', borderRadius: 14, paddingVertical: 15, alignItems: 'center'},
  sosBtnText:    {color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3},
  dismissBtn:    {flex: 1, backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#1E2D45'},
  dismissBtnText:{color: '#A0AEC0', fontWeight: '600', fontSize: 14},

  // Badges
  badgeRow:   {flexDirection: 'row', gap: 8, marginBottom: 14},
  badge:      {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 6, borderWidth: 1},
  badgeIcon:  {fontSize: 13},
  badgeDot:   {width: 6, height: 6, borderRadius: 3},
  badgeText:  {fontSize: 12, fontWeight: '600'},

  // HR Hero
  hrHero:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0C0F1A', borderRadius: 18, paddingVertical: 20, paddingHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: '#111827'},
  hrHeroLeft:  {flex: 1},
  hrHeroLabel: {fontSize: 11, color: '#3D4E6A', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6},
  hrHeroValRow:{flexDirection: 'row', alignItems: 'flex-end', gap: 4},
  hrHeroVal:   {fontSize: 64, fontWeight: '900', color: '#E8EDF5', lineHeight: 68},
  hrHeroUnit:  {fontSize: 18, color: '#3D4E6A', fontWeight: '600', marginBottom: 8},
  hrHeroMeta:  {fontSize: 12, color: '#3D4E6A', marginTop: 4},
  hrSourceDot: {color: '#00E5A0'},
  hrHeroRight: {paddingLeft: 16},
  hrPulseRing: {width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  hrPulseEmoji:{fontSize: 30},

  // Metric Grid
  grid:        {flexDirection: 'row', gap: 10, marginBottom: 12},
  metricCard:  {flex: 1, backgroundColor: '#0C0F1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#111827', alignItems: 'center'},
  metricIconWrap:{width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  metricIcon:  {fontSize: 22},
  metricValue: {fontSize: 22, fontWeight: '800'},
  metricUnit:  {fontSize: 12, color: '#3D4E6A', fontWeight: '400'},
  metricLabel: {fontSize: 10, color: '#3D4E6A', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1},
  metricSub:   {fontSize: 11, fontWeight: '600', marginTop: 4},

  // Section
  section:       {backgroundColor: '#0C0F1A', borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#111827'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6},
  sectionTitle:  {fontSize: 14, fontWeight: '700', color: '#E8EDF5', letterSpacing: 0.3},
  sectionDesc:   {fontSize: 12, color: '#3D4E6A', marginBottom: 14, lineHeight: 19},
  connectedPill: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#00E5A010', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5, borderWidth: 1, borderColor: '#00E5A030'},
  connectedDot:  {width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E5A0'},
  connectedText: {fontSize: 11, color: '#00E5A0', fontWeight: '600'},

  // Breakdown bars
  barRow:      {flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12},
  barIconWrap: {width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  barIcon:     {fontSize: 18},
  barContent:  {flex: 1},
  barTopRow:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7},
  barLabel:    {fontSize: 13, color: '#E8EDF5', fontWeight: '600'},
  barTrack:    {height: 8, backgroundColor: '#1A2235', borderRadius: 4, overflow: 'hidden'},
  barFill:     {height: 8, borderRadius: 4},
  barScore:    {fontSize: 13, fontWeight: '800'},
  barMax:      {fontSize: 11, color: '#3D4E6A', fontWeight: '400'},
  barPct:      {fontSize: 10, marginTop: 5, letterSpacing: 0.3},
  scorePill:   {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1},
  scorePillText:{fontSize: 12, fontWeight: '800'},

  // Buttons
  btnPrimary: {backgroundColor: '#1A3A8F', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D55CC'},
  btnDanger:  {backgroundColor: '#2A0815', borderRadius: 14, borderWidth: 1, borderColor: '#FF336650', paddingVertical: 14, alignItems: 'center'},
  btnMuted:   {opacity: 0.4},
  btnText:    {color: '#E8EDF5', fontWeight: '700', fontSize: 14, letterSpacing: 0.3},
  errorText:  {color: '#FF3366', fontSize: 12, marginBottom: 10, textAlign: 'center'},

  // Tip
  tipCard: {flexDirection: 'row', backgroundColor: '#0C0F1A', borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#111827', gap: 14, alignItems: 'flex-start'},
  tipIcon: {fontSize: 24, marginTop: 2},
  tipBody: {flex: 1},
  tipTitle:{fontSize: 13, fontWeight: '700', color: '#E8EDF5', marginBottom: 6},
  tipText: {color: '#A0AEC0', fontSize: 13, lineHeight: 20},
});
