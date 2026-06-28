/**
 * StressContext.jsx
 *
 * Consumes GoogleFitContext + BleContext separately.
 * Exposes both data sources independently so any screen
 * can read GF data, BLE data, and stress result individually.
 *
 * KEY CHANGE — Background SOS:
 *   StressContext registers a callback with BleContext via registerStressCallback().
 *   This callback fires on EVERY HR reading from the native BLE subscription,
 *   in BOTH foreground and background — completely bypassing React's render cycle.
 *   stress computation + SOSService.triggerStressSos run in that callback,
 *   so SOS fires even when the app is backgrounded.
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
import { AppState } from 'react-native';
import { useGoogleFit } from './GoogleFitContext';
import { useBle } from './BleContext';
import { StressDataService } from '../services/stressData.service';
import { useSocket } from './SocketContext';
import { buildStressRecord } from '../models/stressRecord.model';
import useUserAuth from '../hook/useUserAuth';
import { SOSService } from '../services/sos.service';
import { useOutgoingRequests } from '../hook/useOutgoingRequests';
import { useLocation } from './LocationContext';
import { displayStressUpdateNotification } from '../services/notification.service';

// ── Stress States ─────────────────────────────
export const STRESS_STATE = {
  RELAXED:  { label: 'Relaxed',  color: '#00E5A0', emoji: '😌', level: 0 },
  LOW:      { label: 'Low',      color: '#7EE8A2', emoji: '🙂', level: 1 },
  MODERATE: { label: 'Moderate', color: '#FFD166', emoji: '😐', level: 2 },
  HIGH:     { label: 'High',     color: '#FF8C42', emoji: '😟', level: 3 },
  CRITICAL: { label: 'Critical', color: '#FF3366', emoji: '🆘', level: 4 },
};

// ── Stress Algorithm ──────────────────────────
export function computeStress({ hrValues = [], maxHR = 190, restingHR = 60 }) {
  const empty = {
    score: 0, state: STRESS_STATE.RELAXED, rmssd: 0,
    currentHR: null, avgHR: 0, hrIntensity: 0, hrScore: 0, rmssdScore: 0,
  };

  if (!hrValues.length) return empty;

  const currentHR = hrValues[hrValues.length - 1];
  const avgHR = hrValues.reduce((a, b) => a + b, 0) / hrValues.length;

  if (currentHR >= 180) return { score: 100, state: STRESS_STATE.CRITICAL, rmssd: 0, currentHR, avgHR: Math.round(avgHR), hrIntensity: 100, hrScore: 40, rmssdScore: 40 };
  if (currentHR >= 160) return { score: 90,  state: STRESS_STATE.CRITICAL, rmssd: 0, currentHR, avgHR: Math.round(avgHR), hrIntensity: 90,  hrScore: 38, rmssdScore: 30 };

  const hrReserve  = maxHR - restingHR;
  const hrIntensity = Math.max(0, (currentHR - restingHR) / hrReserve);
  let hrScore = hrIntensity * 40;
  if (currentHR >= 140) hrScore = Math.max(hrScore, 35);
  else if (currentHR >= 120) hrScore = Math.max(hrScore, 30);
  hrScore = Math.min(40, hrScore);

  let rmssd = 0, rmssdScore = 0;
  if (hrValues.length >= 3) {
    const mean     = avgHR;
    const variance = hrValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hrValues.length;
    const stdDev   = Math.sqrt(variance);
    rmssd = stdDev;
    if (stdDev < 2)  rmssdScore = 30;
    else if (stdDev < 5)  rmssdScore = 20;
    else if (stdDev < 10) rmssdScore = 10;
    else rmssdScore = 0;
  }

  let trendScore = 0;
  if (hrValues.length >= 5) {
    const trend = hrValues[hrValues.length - 1] - hrValues[hrValues.length - 5];
    if (trend > 25)       trendScore = 20;
    else if (trend > 15)  trendScore = 15;
    else if (trend > 8)   trendScore = 10;
    else if (trend < -10) trendScore = -5;
  }

  if (currentHR > 120 && rmssd < 3) rmssdScore += 10;

  let score = Math.max(0, Math.min(100, hrScore + rmssdScore + trendScore));

  let state = STRESS_STATE.RELAXED;
  if (score >= 80 || currentHR >= 150)      state = STRESS_STATE.CRITICAL;
  else if (score >= 60 || currentHR >= 130) state = STRESS_STATE.HIGH;
  else if (score >= 40)                     state = STRESS_STATE.MODERATE;
  else if (score >= 20)                     state = STRESS_STATE.LOW;

  return {
    score: Math.round(score), state,
    rmssd: Math.round(rmssd), currentHR,
    avgHR: Math.round(avgHR),
    hrIntensity: Math.round(hrIntensity * 100),
    hrScore: Math.round(hrScore),
    rmssdScore: Math.round(rmssdScore),
  };
}

// ── Context ───────────────────────────────────
const StressContext = createContext(null);

// ── Provider ──────────────────────────────────
export function StressProvider({ children, criticalThreshold = 76 }) {
  const gf  = useGoogleFit();
  const ble = useBle();

  const { isAuthenticated } = useUserAuth();
  const { on, emitNoAck, isConnected } = useSocket();
  const { fetchOutgoingRequests } = useOutgoingRequests();
  const { currentLocation, getCurrentPosition } = useLocation();

  const [sosArmed, setSosArmed]                       = useState(false);
  const [lastRecordedFallback, setLastRecordedFallback] = useState(null);
  const [contactsLastHealthData, setContactsLastHealthData] = useState(null);
  const [manualHROverride, setManualHROverride]         = useState(null);

  // ── Refs that the background SOS callback reads ────────────────────────────
  // These refs always hold the latest values without closure staleness.
  const lastSosTriggerScoreRef  = useRef(0);
  const lastSavedAtRef          = useRef(0);
  const lastSavedFingerprintRef = useRef('');
  const currentLocationRef      = useRef(currentLocation);
  const criticalThresholdRef    = useRef(criticalThreshold);
  const isAuthenticatedRef      = useRef(isAuthenticated);
  const emitNoAckRef            = useRef(emitNoAck);
  const fetchOutgoingRef        = useRef(fetchOutgoingRequests);

  // Keep refs fresh on every render
  useEffect(() => { currentLocationRef.current = currentLocation; }, [currentLocation]);
  useEffect(() => { criticalThresholdRef.current = criticalThreshold; }, [criticalThreshold]);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { emitNoAckRef.current = emitNoAck; }, [emitNoAck]);
  useEffect(() => { fetchOutgoingRef.current = fetchOutgoingRequests; }, [fetchOutgoingRequests]);

  const handleStressSideEffects = useCallback((computedStress, source, isBackground) => {
    console.log(`🧠 [STRESS] handleStressSideEffects: score=${computedStress.score} source=${source} bg=${isBackground}`);
    const inCriticalRange =
      computedStress.score >= criticalThresholdRef.current && computedStress.score <= 100;

    // Rising edge only: trigger SOS as score climbs in critical range.
    if (inCriticalRange && computedStress.score > lastSosTriggerScoreRef.current) {
      lastSosTriggerScoreRef.current = computedStress.score;
      setSosArmed(true);

      console.log(`🆘 [STRESS] SOS triggered! score=${computedStress.score} bg=${isBackground} source=${source}`);

      Promise.resolve(
        displayStressUpdateNotification({
          score:      computedStress.score,
          stateLabel: computedStress.state?.label,
          source,
          currentHR:  computedStress.currentHR,
        }),
      ).catch(err => console.log('Stress notification failed:', err));

      (async () => {
        try {
          const location =
            currentLocationRef.current ?? (await getCurrentPosition());
          console.log(`🆘 [STRESS] trigger SOS location: ${location?.latitude}, ${location?.longitude}`);
          SOSService.triggerStressSos(
            {
              hr:           computedStress.currentHR,
              stress_score: computedStress.score,
              latitude:     location?.latitude,
              longitude:    location?.longitude,
            },
            result => {
              if (result?.success) {
                fetchOutgoingRef.current?.();
              }
            },
          );
        } catch (e) {
          console.error('❌ [STRESS] SOS trigger failed:', e.message);
        }
      })();
    }

    if (!inCriticalRange) {
      lastSosTriggerScoreRef.current = 0;
      setSosArmed(false);
    }
  }, [getCurrentPosition]);

  // ────────────────────────────────────────────
  // BACKGROUND SOS CALLBACK
  //
  // Registered with BleContext via registerStressCallback().
  // Called on EVERY HR reading from the native BLE subscription.
  // Fires in BOTH foreground and background — React render cycle NOT involved.
  //
  // This is the core of background SOS: when HR arrives in background,
  // we compute stress and call SOSService directly, no useEffect needed.
  // ────────────────────────────────────────────
  const handleBleHRBuffer = useCallback((hrBuffer) => {
    if (!hrBuffer.length) return;

    const isBackground = AppState.currentState !== 'active';
    const stress = computeStress({ hrValues: hrBuffer });

    console.log(
      `🧠 [STRESS] score=${stress.score} hr=${stress.currentHR} bg=${isBackground}`
    );
    handleStressSideEffects(stress, 'ble', isBackground);

    // ── Persist stress record (throttled, foreground only to avoid DB hammering) ─
    if (!isBackground) {
      const now = Date.now();
      if (now - lastSavedAtRef.current >= 10_000 && stress.currentHR != null) {
        const fingerprint = `ble:${stress.currentHR}:${stress.score}:${stress.rmssd}:${stress.avgHR}`;
        if (fingerprint !== lastSavedFingerprintRef.current) {
          lastSavedAtRef.current         = now;
          lastSavedFingerprintRef.current = fingerprint;

          const insertData = buildStressRecord({
            stress,
            activeSource: 'ble',
            bleData: {
              currentHR: stress.currentHR,
              hrBuffer,
              avgHR:     stress.avgHR,
              minHR:     Math.min(...hrBuffer),
              maxHR:     Math.max(...hrBuffer),
            },
            googleFitData: {},
          });

          emitNoAckRef.current?.('contact:healthdata:update', JSON.stringify(insertData));
          StressDataService.insertFromContext(insertData, result => {
            if (__DEV__ && !result?.success) {
              console.log('Stress save skipped/failed:', result?.error);
            }
          });
        }
      }
    }
    
  }, [handleStressSideEffects]);

  // ── Register the callback with BleContext ─────────────────────────────────
  // This wires the native HR stream directly to stress computation.
  // The callback survives screen changes and background because it's module-level in BleContext.
  useEffect(() => {
    const unregister = ble.registerStressCallback(handleBleHRBuffer);
    return unregister;
  }, [ble.registerStressCallback, handleBleHRBuffer]);

  // ────────────────────────────────────────────
  // GOOGLE FIT DATA BLOCK
  // ────────────────────────────────────────────
  const googleFitData = useMemo(() => ({
    hrReadings: gf.hrReadings,
    hrValues:   gf.hrReadings.map(r => r.value),
    latestHR:   gf.hrReadings.length ? gf.hrReadings[gf.hrReadings.length - 1].value : null,
    avgHR:      gf.hrReadings.length
                  ? Math.round(gf.hrReadings.reduce((a, r) => a + r.value, 0) / gf.hrReadings.length)
                  : null,
    authorized: gf.authorized,
    loading:    gf.loading,
    error:      gf.error,
    authorize:  gf.authorize,
    refresh:    gf.refresh,
  }), [gf]);

  // ────────────────────────────────────────────
  // BLE DATA BLOCK
  // ────────────────────────────────────────────
  const bleData = useMemo(() => ({
    currentHR:  ble.currentHR,
    hrBuffer:   ble.hrBuffer,
    latestHR:   ble.currentHR,
    avgHR:      ble.hrBuffer.length
                  ? Math.round(ble.hrBuffer.reduce((a, b) => a + b, 0) / ble.hrBuffer.length)
                  : null,
    minHR:      ble.hrBuffer.length ? Math.min(...ble.hrBuffer) : null,
    maxHR:      ble.hrBuffer.length ? Math.max(...ble.hrBuffer) : null,
    deviceName: ble.deviceName,
    connected:  ble.connected,
    scanning:   ble.scanning,
    error:      ble.error,
    startScan:  ble.startScan,
    disconnect: ble.disconnect,
  }), [ble]);

  // ────────────────────────────────────────────
  // ACTIVE SOURCE & STRESS (for React UI / foreground)
  // ────────────────────────────────────────────
  const activeSource = ble.connected && ble.hrBuffer.length > 0 ? 'ble' : 'googlefit';

  const mergedHRValues = manualHROverride !== null
    ? Array(15).fill(manualHROverride)
    : activeSource === 'ble'
      ? ble.hrBuffer
      : gf.hrReadings.map(r => r.value);

  const stress = useMemo(
    () => computeStress({ hrValues: mergedHRValues }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mergedHRValues.join(',')],
  );

  // Run the same stress side-effects for non-BLE sources (GoogleFit/HealthConnect/manual).
  useEffect(() => {
    if (activeSource === 'ble') return;
    if (stress.currentHR == null) return;

    const source = manualHROverride !== null ? 'manual' : 'googlefit';
    const isBackground = AppState.currentState !== 'active';
    handleStressSideEffects(stress, source, isBackground);
  }, [activeSource, manualHROverride, stress, handleStressSideEffects]);

  const hasLiveData = mergedHRValues.length > 0;

  // ── Fallback to last saved record when no live data ───────────────────────
  useEffect(() => {
    if (hasLiveData) { setLastRecordedFallback(null); return; }
    if (!isAuthenticated) { setLastRecordedFallback(null); return; }

    StressDataService.getLatest(result => {
      if (!result?.success) return;
      const latest = result.data;
      if (!latest) { setLastRecordedFallback(null); return; }

      const fallbackState =
        Object.values(STRESS_STATE).find(s => s.label === latest.stress_state) ||
        STRESS_STATE.RELAXED;

      setLastRecordedFallback({
        stress: {
          score:       Number(latest.stress_score ?? 0),
          state:       fallbackState,
          rmssd:       Number(latest.rmssd ?? 0),
          currentHR:   latest.current_hr == null ? null : Number(latest.current_hr),
          avgHR:       latest.avg_hr == null ? null : Number(latest.avg_hr),
          hrIntensity: Number(latest.hr_intensity ?? 0),
          hrScore:     Number(latest.hr_score ?? 0),
          rmssdScore:  Number(latest.rmssd_score ?? 0),
        },
        source:     latest.source,
        recordedAt: latest.created_at,
      });
    });
  }, [hasLiveData, isAuthenticated]);

  const resolvedStress       = hasLiveData ? stress : (lastRecordedFallback?.stress ?? stress);
  const resolvedActiveSource = hasLiveData ? activeSource : (lastRecordedFallback?.source ?? activeSource);

  // ── GoogleFit stress persistence (when BLE not active) ───────────────────
  useEffect(() => {
    const hasBleData    = ble.connected && ble.hrBuffer.length > 0;
    const hasGfData     = gf.hrReadings.length > 0;
    const hasManualData = manualHROverride !== null;

    // When BLE is active, persistence is handled in handleBleHRBuffer (above).
    // This block only handles GoogleFit and manual override sources.
    if (hasBleData) return;
    if (!hasGfData && !hasManualData) return;
    if (stress.currentHR == null) return;

    const now = Date.now();
    if (now - lastSavedAtRef.current < 10_000) return;

    const effectiveSource = hasManualData ? 'manual' : 'googlefit';
    const fingerprint = `${effectiveSource}:${stress.currentHR}:${stress.score}:${stress.rmssd}:${stress.avgHR}`;
    if (fingerprint === lastSavedFingerprintRef.current) return;

    lastSavedAtRef.current          = now;
    lastSavedFingerprintRef.current = fingerprint;

    const insertData = buildStressRecord({ stress, activeSource: effectiveSource, bleData, googleFitData });
    emitNoAck('contact:healthdata:update', JSON.stringify(insertData));
    StressDataService.insertFromContext(insertData, result => {
      if (__DEV__ && !result?.success) console.log('Stress save skipped/failed:', result?.error);
    });
  }, [
    activeSource, ble.connected, ble.hrBuffer.length,
    bleData, gf.hrReadings.length, googleFitData,
    manualHROverride, stress, emitNoAck,
  ]);

  const sendSos    = useCallback(() => { console.log('SOS manually triggered by user'); }, []);
  const dismissSos = useCallback(() => setSosArmed(false), []);

  // ── Fetch contacts' last health data ──────────────────────────────────────
  const getContactLastHealthData = useCallback(async () => {
    try {
      const response = await new Promise((resolve, reject) => {
        StressDataService.getContactsLastHealthData(result => {
          if (result?.success) resolve(result.data);
          else reject(new Error(result?.error || 'Unknown error fetching health data'));
        });
      });

      if (response?.data) {
        const contactStressData = [];
        response.data.forEach(contact => {
          contactStressData[contact.user_id] = {
            stress: {
              score:       Number(contact.stress_score ?? 0),
              state:       Object.values(STRESS_STATE).find(
                             s => s.label.toLowerCase() === (contact.stress_state ?? '').toLowerCase()
                           ) ?? STRESS_STATE.RELAXED,
              rmssd:       Number(contact.rmssd ?? 0),
              currentHR:   contact.current_hr == null ? null : Number(contact.current_hr),
              avgHR:       contact.avg_hr == null ? null : Number(contact.avg_hr),
              hrIntensity: Number(contact.hr_intensity ?? 0),
              hrScore:     Number(contact.hr_score ?? 0),
              rmssdScore:  Number(contact.rmssd_score ?? 0),
            },
            source:     contact.source,
            recordedAt: contact.created_at,
          };
        });
        setContactsLastHealthData(contactStressData);
      }
    } catch (err) {
      console.error('Failed to get contacts last health data:', err.message);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) getContactLastHealthData();
  }, [getContactLastHealthData, isAuthenticated]);

  // ── Socket: contacts' live health updates ─────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    const unsubs = [
      on('contact:healthdata:updated', payload => {
        const data = {};
        try {
          if (typeof payload === 'string') Object.assign(data, JSON.parse(payload));
          else if (typeof payload === 'object' && payload !== null) Object.assign(data, payload);
          else return;
        } catch (err) {
          console.error('Failed to parse contact:healthdata:updated:', err.message);
          return;
        }

        if (data?.userId) {
          const h = data.healthData || {};
          setContactsLastHealthData(prev => ({
            ...prev,
            [data.userId]: {
              stress: {
                score:       Number(h.stress_score ?? 0),
                state:       Object.values(STRESS_STATE).find(
                               s => s.label.toLowerCase() === (h.stress_state ?? '').toLowerCase()
                             ) ?? STRESS_STATE.RELAXED,
                rmssd:       Number(h.rmssd ?? 0),
                currentHR:   h.current_hr == null ? null : Number(h.current_hr),
                avgHR:       h.avg_hr == null ? null : Number(h.avg_hr),
                hrIntensity: Number(h.hr_intensity ?? 0),
                hrScore:     Number(h.hr_score ?? 0),
                rmssdScore:  Number(h.rmssd_score ?? 0),
              },
              source:     h.source,
              recordedAt: h.created_at,
            },
          }));
        }
      }),
    ];

    return () => unsubs.forEach(u => u());
  }, [isConnected, on, emitNoAck]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    stress:            resolvedStress,
    googleFitData,
    bleData,
    activeSource:      resolvedActiveSource,
    hasLiveData,
    isUsingLastRecord: !hasLiveData && !!lastRecordedFallback,
    lastRecordedAt:    lastRecordedFallback?.recordedAt ?? null,
    sosArmed,
    sendSos,
    dismissSos,
    contactsLastHealthData,
    manualHROverride,
    setManualHR:   setManualHROverride,
    clearManualHR: () => setManualHROverride(null),
  }), [
    resolvedStress, googleFitData, bleData, resolvedActiveSource,
    hasLiveData, lastRecordedFallback, sosArmed, sendSos, dismissSos,
    contactsLastHealthData, manualHROverride,
  ]);

  return (
    <StressContext.Provider value={value}>
      {children}
    </StressContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────
export function useStress()       { const ctx = useContext(StressContext); if (!ctx) throw new Error('useStress must be inside StressProvider'); return ctx; }
export function useStressScore()  { return useStress().stress; }
export function useGoogleFitData(){ return useStress().googleFitData; }
export function useBleData()      { return useStress().bleData; }
export function useSos()          { const { sosArmed, sendSos, dismissSos } = useStress(); return { sosArmed, sendSos, dismissSos }; }
export function useActiveSource() { return useStress().activeSource; }