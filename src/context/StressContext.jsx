/**
 * StressContext.jsx
 *
 * Consumes GoogleFitContext + BleContext separately.
 * Exposes both data sources independently so any screen
 * can read GF data, BLE data, and stress result individually.
 *
 * Exposed via useStress():
 *   stress        → computed score, state, breakdown
 *   googleFitData → hr (from GF only)
 *   bleData       → currentHR, hrBuffer, device info (from BLE only)
 *   activeSource  → 'ble' | 'googlefit'
 *   sosArmed, sendSos, dismissSos
 */

import React, {
  createContext, useContext, useState, useEffect,
  useMemo, useCallback, useRef,
} from 'react';
import {Vibration, Alert} from 'react-native';
import {useGoogleFit} from './GoogleFitContext';
import {useBle} from './BleContext';

// ── Stress States ─────────────────────────────
export const STRESS_STATE = {
  RELAXED:  {label: 'Relaxed',  color: '#00E5A0', emoji: '😌', level: 0},
  LOW:      {label: 'Low',      color: '#7EE8A2', emoji: '🙂', level: 1},
  MODERATE: {label: 'Moderate', color: '#FFD166', emoji: '😐', level: 2},
  HIGH:     {label: 'High',     color: '#FF8C42', emoji: '😟', level: 3},
  CRITICAL: {label: 'Critical', color: '#FF3366', emoji: '🆘', level: 4},
};

// ── Stress Algorithm ──────────────────────────
export function computeStress({
  hrValues = [],
  maxHR = 190,
  restingHR = 60,
}) {
  const empty = {
    score: 0,
    state: STRESS_STATE.RELAXED,
    rmssd: 0,
    currentHR: null,
    avgHR: 0,
    hrIntensity: 0,
    hrScore: 0,
    rmssdScore: 0,
  };

  if (!hrValues.length) return empty;

  const currentHR = hrValues[hrValues.length - 1];
  const avgHR =
    hrValues.reduce((a, b) => a + b, 0) / hrValues.length;

  // 🚨 ── 0. HARD SAFETY OVERRIDES ─────────────

  // Extreme abnormal (sensor or real danger)
  if (currentHR >= 180) {
    return {
      score: 100,
      state: STRESS_STATE.CRITICAL,
      rmssd: 0,
      currentHR,
      avgHR: Math.round(avgHR),
      hrIntensity: 100,
      hrScore: 40,
      rmssdScore: 40,
    };
  }

  // Very high HR (almost always critical)
  if (currentHR >= 160) {
    return {
      score: 90,
      state: STRESS_STATE.CRITICAL,
      rmssd: 0,
      currentHR,
      avgHR: Math.round(avgHR),
      hrIntensity: 90,
      hrScore: 38,
      rmssdScore: 30,
    };
  }

  // ── 1. HR INTENSITY (0–40) ────────────────
  const hrReserve = maxHR - restingHR;
  const hrIntensity = Math.max(
    0,
    (currentHR - restingHR) / hrReserve
  );

  let hrScore = hrIntensity * 40;

  // Boost for high HR
  if (currentHR >= 140) hrScore = Math.max(hrScore, 35);
  else if (currentHR >= 120) hrScore = Math.max(hrScore, 30);

  hrScore = Math.min(40, hrScore);

  // ── 2. VARIABILITY (STD DEV instead of fake RMSSD) ──
  let rmssd = 0;
  let rmssdScore = 0;

  if (hrValues.length >= 3) {
    const mean = avgHR;
    const variance =
      hrValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      hrValues.length;

    const stdDev = Math.sqrt(variance);
    rmssd = stdDev;

    // Low variability = stress
    if (stdDev < 2) rmssdScore = 30;
    else if (stdDev < 5) rmssdScore = 20;
    else if (stdDev < 10) rmssdScore = 10;
    else rmssdScore = 0;
  }

  // ── 3. TREND (0–20) ──────────────────────
  let trendScore = 0;

  if (hrValues.length >= 5) {
    const trend =
      hrValues[hrValues.length - 1] -
      hrValues[hrValues.length - 5];

    if (trend > 25) trendScore = 20;
    else if (trend > 15) trendScore = 15;
    else if (trend > 8) trendScore = 10;
    else if (trend < -10) trendScore = -5;
  }

  // ── 4. HIGH HR + LOW VARIABILITY BOOST ───
  if (currentHR > 120 && rmssd < 3) {
    rmssdScore += 10;
  }

  // ── FINAL SCORE ──────────────────────────
  let score = hrScore + rmssdScore + trendScore;

  score = Math.max(0, Math.min(100, score));

  // ── STATE ────────────────────────────────
  let state = STRESS_STATE.RELAXED;

  if (score >= 80 || currentHR >= 150) {
    state = STRESS_STATE.CRITICAL;
  } else if (score >= 60 || currentHR >= 130) {
    state = STRESS_STATE.HIGH;
  } else if (score >= 40) {
    state = STRESS_STATE.MODERATE;
  } else if (score >= 20) {
    state = STRESS_STATE.LOW;
  }

  return {
    score: Math.round(score),
    state,
    rmssd: Math.round(rmssd),
    currentHR,
    avgHR: Math.round(avgHR),
    hrIntensity: Math.round(hrIntensity * 100),
    hrScore: Math.round(hrScore),
    rmssdScore: Math.round(rmssdScore),
  };
}
// ── Context ───────────────────────────────────
const StressContext = createContext(null);

// ── Provider ──────────────────────────────────
export function StressProvider({
  children,
  criticalThreshold=40,
  onSosTriggered=null,
}) {
  const gf  = useGoogleFit();
  const ble = useBle();

  const [sosArmed, setSosArmed] = useState(false);
  const prevScoreRef = useRef(0);

  // ────────────────────────────────────────────
  // GOOGLE FIT DATA BLOCK
  // Pure GF snapshot — all fields from Google Fit only
  // ────────────────────────────────────────────
  const googleFitData = useMemo(() => ({
    // Heart Rate from Google Fit
    hrReadings: gf.hrReadings,                              // [{value, startDate}]
    hrValues:   gf.hrReadings.map(r => r.value),           // [bpm, bpm, ...]
    latestHR:   gf.hrReadings.length
                  ? gf.hrReadings[gf.hrReadings.length - 1].value
                  : null,
    avgHR: gf.hrReadings.length
      ? Math.round(gf.hrReadings.reduce((a,r)=>a+r.value,0) / gf.hrReadings.length)
      : null,

    // Status
    authorized: gf.authorized,
    loading:    gf.loading,
    error:      gf.error,

    // Actions
    authorize: gf.authorize,
    refresh:   gf.refresh,
  }), [gf]);

  // ────────────────────────────────────────────
  // BLE DATA BLOCK
  // Pure BLE snapshot — live HR stream only
  // Updates every ~1 second when device is connected
  // ────────────────────────────────────────────
  const bleData = useMemo(() => ({
    // Live Heart Rate
    currentHR: ble.currentHR,                              // latest single reading
    hrBuffer:  ble.hrBuffer,                               // last 60 readings array
    latestHR:  ble.currentHR,
    avgHR: ble.hrBuffer.length
      ? Math.round(ble.hrBuffer.reduce((a,b)=>a+b,0) / ble.hrBuffer.length)
      : null,
    minHR: ble.hrBuffer.length ? Math.min(...ble.hrBuffer) : null,
    maxHR: ble.hrBuffer.length ? Math.max(...ble.hrBuffer) : null,

    // Device Info
    deviceName: ble.deviceName,
    connected:  ble.connected,
    scanning:   ble.scanning,
    error:      ble.error,

    // Actions
    startScan:  ble.startScan,
    disconnect: ble.disconnect,
  }), [ble]);

  // ────────────────────────────────────────────
  // ACTIVE SOURCE
  // BLE takes priority when connected + has data
  // ────────────────────────────────────────────
  const activeSource = ble.connected && ble.hrBuffer.length > 0
    ? 'ble'
    : 'googlefit';

  const mergedHRValues = activeSource === 'ble'
    ? ble.hrBuffer
    : gf.hrReadings.map(r => r.value);

  // ────────────────────────────────────────────
  // STRESS CALCULATION
  // Uses merged HR + GF context data (sleep, spo2)
  // ────────────────────────────────────────────
  const stress = useMemo(() =>
    computeStress({hrValues: mergedHRValues}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mergedHRValues.join(',')],
  );

  // ────────────────────────────────────────────
  // SOS AUTO-TRIGGER
  // Fires only on rising edge: normal → critical
  // ────────────────────────────────────────────
  useEffect(() => {
    console.log(`Stress score updated: ${stress.score} (${stress.state.label}) — Source: ${activeSource}`);
    console.log({criticalThreshold})
    const isCritical  = stress.score >= criticalThreshold;
    const wasCritical = prevScoreRef.current >= criticalThreshold;
    prevScoreRef.current = stress.score;
    console.log(`isCritical: ${isCritical}, wasCritical: ${wasCritical}, sosArmed: ${sosArmed}`);
    if (isCritical && !wasCritical && !sosArmed) {
      setSosArmed(true);
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);

      Alert.alert(
        '🆘 Critical Stress Detected',
        [
          `Stress Index : ${stress.score}/100`,
          `Heart Rate   : ${stress.currentHR ?? '–'} bpm`,
          `HRV (RMSSD)  : ${stress.rmssd} ms`,
          `Source       : ${activeSource === 'ble'
              ? `BLE — ${ble.deviceName}`
              : 'Google Fit'}`,
        ].join('\n'),
        [
          {text: 'Not now', style: 'cancel', onPress: () => setSosArmed(false)},
          {
            text: 'Send SOS 🆘',
            style: 'destructive',
            onPress: () => {
              onSosTriggered?.({stress, googleFitData, bleData, activeSource});
              setSosArmed(false);
            },
          },
        ],
        {cancelable: false},
      );
    }
    if (!isCritical && sosArmed) setSosArmed(false);
  }, [stress.score]);

  const sendSos = useCallback(() => {
    onSosTriggered?.({stress, googleFitData, bleData, activeSource});
    setSosArmed(false);
  }, [stress, googleFitData, bleData, activeSource]);

  const dismissSos = useCallback(() => setSosArmed(false), []);

  // ────────────────────────────────────────────
  // CONTEXT VALUE
  // ────────────────────────────────────────────
  const value = useMemo(() => ({
    stress,           // computed stress result
    googleFitData,    // ← GF-only block
    bleData,          // ← BLE-only block
    activeSource,     // 'ble' | 'googlefit'
    sosArmed,
    sendSos,
    dismissSos,
  }), [stress, googleFitData, bleData, activeSource, sosArmed]);

  return (
    <StressContext.Provider value={value}>
      {children}
    </StressContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOKS — consume only what you need
// ─────────────────────────────────────────────

/** Everything */
export function useStress() {
  const ctx = useContext(StressContext);
  if (!ctx) throw new Error('useStress must be inside StressProvider');
  return ctx;
}

/** Only stress score + state → gauge, banner */
export function useStressScore() {
  const {stress} = useStress();
  return stress;
}

/** Only Google Fit data → sleep, spo2 cards */
export function useGoogleFitData() {
  const {googleFitData} = useStress();
  return googleFitData;
}

/** Only BLE data → live HR, device status */
export function useBleData() {
  const {bleData} = useStress();
  return bleData;
}

/** Only SOS controls */
export function useSos() {
  const {sosArmed, sendSos, dismissSos} = useStress();
  return {sosArmed, sendSos, dismissSos};
}

/** Which source is driving stress calc */
export function useActiveSource() {
  const {activeSource} = useStress();
  return activeSource;
}
