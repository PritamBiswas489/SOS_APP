/**
 * MyStressMonitor — Health Connect edition
 */

import React, {useRef, useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, Platform,
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

// ── BLE Device Panel ─────────────────────────
function ScanDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {toValue: 1,   duration: 400, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0.3, duration: 400, useNativeDriver: true}),
          Animated.delay(800),
        ]),
      ).start();
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.scanDots}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.View key={i} style={[styles.scanDot, {opacity: d}]} />
      ))}
    </View>
  );
}

function BleDevicePanel({ble}) {
  const ringAnim = useRef(new Animated.Value(0)).current;
  const ringLoop = useRef(null);

  useEffect(() => {
    ringLoop.current?.stop();
    ringAnim.setValue(0);
    if (ble.scanning) {
      ringLoop.current = Animated.loop(
        Animated.timing(ringAnim, {toValue: 1, duration: 1800, useNativeDriver: true}),
      );
      ringLoop.current.start();
    }
    return () => ringLoop.current?.stop();
  }, [ble.scanning]);

  const ringScale  = ringAnim.interpolate({inputRange: [0, 1], outputRange: [1, 1.9]});
  const ringOpacity = ringAnim.interpolate({inputRange: [0, 0.6, 1], outputRange: [0.5, 0.15, 0]});

  const statusColor = ble.connected ? '#00E5A0' : ble.scanning ? '#7EB8F7' : '#3D4E6A';

  return (
    <View style={styles.blePanel}>
      <View style={styles.blePanelRow}>
        {/* Icon with scan ring */}
        <View style={styles.bleIconWrap}>
          {ble.scanning && (
            <Animated.View style={[styles.bleScanRing, {
              transform: [{scale: ringScale}],
              opacity: ringOpacity,
              borderColor: '#7EB8F7',
            }]} />
          )}
          <View style={[styles.bleIconCircle, {
            borderColor: statusColor + '60',
            backgroundColor: statusColor + '10',
          }]}>
            <Text style={styles.bleIconText}>📡</Text>
          </View>
          <View style={[styles.bleStatusDot, {backgroundColor: statusColor}]} />
        </View>

        {/* Info */}
        <View style={styles.bleInfo}>
          <Text style={styles.bleDeviceName} numberOfLines={1}>
            {ble.connected
              ? (ble.deviceName || 'HR Device')
              : ble.scanning ? 'Scanning for devices…'
              : 'Bluetooth HR Device'}
          </Text>
          {ble.connected && ble.currentHR ? (
            <View style={styles.bleHrRow}>
              <Text style={styles.bleHrVal}>{ble.currentHR}</Text>
              <Text style={styles.bleHrUnit}> bpm</Text>
              <View style={styles.bleLiveBadge}>
                <View style={styles.bleLiveDot} />
                <Text style={styles.bleLiveText}>LIVE</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.bleDeviceSub}>
              {ble.connected
                ? 'Waiting for HR data…'
                : ble.scanning
                ? 'HR Service · 0x180D'
                : 'Tap to pair a smartwatch or chest strap'}
            </Text>
          )}
        </View>

        {/* Action */}
        {!ble.connected ? (
          <TouchableOpacity
            style={[styles.bleActionBtn, ble.scanning && styles.bleActionBtnMuted]}
            onPress={ble.startScan}
            disabled={ble.scanning}
            activeOpacity={0.75}>
            {ble.scanning
              ? <ScanDots />
              : <Text style={styles.bleActionBtnText}>Scan</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bleActionBtnDisconnect}
            onPress={ble.disconnect}
            activeOpacity={0.75}>
            <Text style={styles.bleActionBtnDisconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      {ble.error ? (
        <View style={styles.bleErrorBox}>
          <Text style={styles.bleErrorIcon}>⚠</Text>
          <Text style={styles.bleErrorText}>{ble.error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Main Component ────────────────────────────
export default function MyStressMonitor() {
  const {stress, sosArmed, sendSos, dismissSos} = useStress();
  const gf  = useGoogleFit();
  const ble = useBle();

  const displayHR = ble.connected && ble.currentHR ? ble.currentHR : stress.currentHR;
  const hrSource  = ble.connected ? 'Live BLE' : 'Health Connect';

  const hrvColor  = stress.rmssd > 40 ? '#00E5A0' : stress.rmssd > 20 ? '#FFD166' : '#FF3366';
  const zoneColor = stress.hrIntensity > 70 ? '#FF3366' : stress.hrIntensity > 50 ? '#FFD166' : '#00E5A0';

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
     

      {/* ── BLE Device (top, always visible) ── */}
      <BleDevicePanel ble={ble} />

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
              <Text style={styles.hrPulseEmoji}>{stress.state.emoji}</Text>
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

        <View style={{height: 32}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   {flex: 1},

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 42 : 50,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#111827',
  },
  headerTitle: {fontSize: 20, fontWeight: '800', color: '#E8EDF5', letterSpacing: 0.3},
  headerSub:   {fontSize: 10, color: '#3D4E6A', marginTop: 2, letterSpacing: 1.4, textTransform: 'uppercase'},
  syncBtn:        {width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E2D45'},
  syncBtnActive:  {borderColor: '#5352ED'},
  syncBtnText:    {color: '#7EB8F7', fontSize: 16, fontWeight: '700'},

  scroll:        {flex: 1},
  scrollContent: {paddingHorizontal: 14, paddingTop: 8},

  // Gauge
  gaugeWrap:      {alignItems: 'center', marginVertical: 10},
  gaugeOuter:     {
    width: 176, height: 176, borderRadius: 88,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0C0F1A',
    shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.35, shadowRadius: 22, elevation: 10,
  },
  gaugeRing:      {position: 'absolute', width: 164, height: 164, borderRadius: 82, borderWidth: 4, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8},
  gaugeInner:     {alignItems: 'center'},
  gaugeEmoji:     {fontSize: 26, marginBottom: 2},
  gaugeScore:     {fontSize: 46, fontWeight: '900', lineHeight: 52},
  gaugeStateLabel:{fontSize: 13, fontWeight: '700', color: '#E8EDF5', marginTop: 1},
  gaugeSubLabel:  {fontSize: 9, color: '#3D4E6A', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1},

  // SOS Banner
  sosBanner:    {flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13, marginBottom: 9, backgroundColor: '#FF336608', gap: 7},
  sosBannerIcon:{fontSize: 14},
  sosBannerText:{fontWeight: '700', fontSize: 12, letterSpacing: 0.4, flex: 1},

  // SOS Actions
  sosActions:    {flexDirection: 'row', gap: 8, marginBottom: 10},
  sosBtn:        {flex: 2, backgroundColor: '#FF3366', borderRadius: 12, paddingVertical: 13, alignItems: 'center'},
  sosBtnText:    {color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3},
  dismissBtn:    {flex: 1, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#1E2D45'},
  dismissBtnText:{color: '#A0AEC0', fontWeight: '600', fontSize: 13},

  // Badges
  badgeRow:   {flexDirection: 'row', gap: 6, marginBottom: 10},
  badge:      {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5, borderWidth: 1},
  badgeIcon:  {fontSize: 11},
  badgeDot:   {width: 5, height: 5, borderRadius: 2.5},
  badgeText:  {fontSize: 11, fontWeight: '600'},

  // HR Hero
  hrHero:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0C0F1A', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#111827'},
  hrHeroLeft:  {flex: 1},
  hrHeroLabel: {fontSize: 10, color: '#3D4E6A', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4},
  hrHeroValRow:{flexDirection: 'row', alignItems: 'flex-end', gap: 4},
  hrHeroVal:   {fontSize: 50, fontWeight: '900', color: '#E8EDF5', lineHeight: 54},
  hrHeroUnit:  {fontSize: 15, color: '#3D4E6A', fontWeight: '600', marginBottom: 6},
  hrHeroMeta:  {fontSize: 11, color: '#3D4E6A', marginTop: 3},
  hrSourceDot: {color: '#00E5A0'},
  hrHeroRight: {paddingLeft: 12},
  hrPulseRing: {width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  hrPulseEmoji:{fontSize: 24},

  // Metric Grid
  grid:        {flexDirection: 'row', gap: 8, marginBottom: 10},
  metricCard:  {flex: 1, backgroundColor: '#0C0F1A', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#111827', alignItems: 'center'},
  metricIconWrap:{width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  metricIcon:  {fontSize: 18},
  metricValue: {fontSize: 20, fontWeight: '800'},
  metricUnit:  {fontSize: 11, color: '#3D4E6A', fontWeight: '400'},
  metricLabel: {fontSize: 9, color: '#3D4E6A', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1},
  metricSub:   {fontSize: 10, fontWeight: '600', marginTop: 3},

  // Section
  section:       {backgroundColor: '#0C0F1A', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#111827'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4},
  sectionTitle:  {fontSize: 13, fontWeight: '700', color: '#E8EDF5', letterSpacing: 0.3},
  sectionDesc:   {fontSize: 11, color: '#3D4E6A', marginBottom: 11, lineHeight: 17},
  connectedPill: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#00E5A010', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 4, borderWidth: 1, borderColor: '#00E5A030'},
  connectedDot:  {width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00E5A0'},
  connectedText: {fontSize: 10, color: '#00E5A0', fontWeight: '600'},

  // Breakdown bars
  barRow:      {flexDirection: 'row', alignItems: 'center', marginBottom: 11, gap: 10},
  barIconWrap: {width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  barIcon:     {fontSize: 15},
  barContent:  {flex: 1},
  barTopRow:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5},
  barLabel:    {fontSize: 12, color: '#E8EDF5', fontWeight: '600'},
  barTrack:    {height: 5, backgroundColor: '#1A2235', borderRadius: 3, overflow: 'hidden'},
  barFill:     {height: 5, borderRadius: 3},
  barScore:    {fontSize: 12, fontWeight: '800'},
  barMax:      {fontSize: 10, color: '#3D4E6A', fontWeight: '400'},
  barPct:      {fontSize: 9, marginTop: 4, letterSpacing: 0.3},
  scorePill:   {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1},
  scorePillText:{fontSize: 11, fontWeight: '800'},

  // Buttons
  btnPrimary: {backgroundColor: '#1A3A8F', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D55CC'},
  btnDanger:  {backgroundColor: '#2A0815', borderRadius: 12, borderWidth: 1, borderColor: '#FF336650', paddingVertical: 12, alignItems: 'center'},
  btnMuted:   {opacity: 0.4},
  btnText:    {color: '#E8EDF5', fontWeight: '700', fontSize: 13, letterSpacing: 0.3},
  errorText:  {color: '#FF3366', fontSize: 11, marginBottom: 8, textAlign: 'center'},

  // BLE Panel — compact fixed strip above scroll
  blePanel:                   {marginHorizontal: 14, marginTop: 8, marginBottom: 4, backgroundColor: '#0C0F1A', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#111827'},
  blePanelRow:                {flexDirection: 'row', alignItems: 'center', gap: 10},
  bleIconWrap:                {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  bleScanRing:                {position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1.5},
  bleIconCircle:              {width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center'},
  bleIconText:                {fontSize: 17},
  bleStatusDot:               {position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#0C0F1A'},
  bleInfo:                    {flex: 1},
  bleDeviceName:              {fontSize: 13, fontWeight: '700', color: '#E8EDF5', marginBottom: 1},
  bleDeviceSub:               {fontSize: 10, color: '#3D4E6A', letterSpacing: 0.2},
  bleHrRow:                   {flexDirection: 'row', alignItems: 'baseline', gap: 1},
  bleHrVal:                   {fontSize: 18, fontWeight: '900', color: '#00E5A0', lineHeight: 22},
  bleHrUnit:                  {fontSize: 11, color: '#3D4E6A', fontWeight: '600'},
  bleLiveBadge:               {flexDirection: 'row', alignItems: 'center', backgroundColor: '#00E5A012', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#00E5A030', gap: 3, marginLeft: 5},
  bleLiveDot:                 {width: 4, height: 4, borderRadius: 2, backgroundColor: '#00E5A0'},
  bleLiveText:                {fontSize: 8, color: '#00E5A0', fontWeight: '800', letterSpacing: 1},
  scanDots:                   {flexDirection: 'row', alignItems: 'center', gap: 3},
  scanDot:                    {width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#7EB8F7'},
  bleActionBtn:               {backgroundColor: '#122040', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2D55CC', alignItems: 'center', justifyContent: 'center', minHeight: 34, minWidth: 56},
  bleActionBtnMuted:          {opacity: 0.55, borderColor: '#7EB8F740', paddingHorizontal: 8},
  bleActionBtnText:           {color: '#7EB8F7', fontWeight: '700', fontSize: 12, letterSpacing: 0.4},
  bleActionBtnDisconnect:     {backgroundColor: '#1A0A0F', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#FF336640', alignItems: 'center', justifyContent: 'center'},
  bleActionBtnDisconnectText: {color: '#FF3366', fontWeight: '700', fontSize: 11, letterSpacing: 0.3},
  bleErrorBox:                {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF336610', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#FF336630', marginTop: 8, gap: 6},
  bleErrorIcon:               {fontSize: 11, color: '#FF3366'},
  bleErrorText:               {flex: 1, color: '#FF3366', fontSize: 10, lineHeight: 15},

  // Tip
  tipCard: {flexDirection: 'row', backgroundColor: '#0C0F1A', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#111827', gap: 12, alignItems: 'flex-start'},
  tipIcon: {fontSize: 20, marginTop: 2},
  tipBody: {flex: 1},
  tipTitle:{fontSize: 12, fontWeight: '700', color: '#E8EDF5', marginBottom: 4},
  tipText: {color: '#A0AEC0', fontSize: 12, lineHeight: 18},
});
