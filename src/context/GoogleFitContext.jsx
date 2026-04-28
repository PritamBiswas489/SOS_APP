/**
 * GoogleFitContext.jsx  (Health Connect version)
 *
 * Replaces react-native-google-fit with react-native-health-connect.
 *
 * Availability logic:
 *   Android 14+ (API 34+) → Built-in, no install needed
 *   Android 9–13 (API 28–33) → Shows "Install Health Connect" Play Store prompt
 *   Android 7–8 (API 24–27) → Shows "Device Not Supported" alert
 *
 * Exposes: hrReadings,
 *          authorized, loading, error, healthConnectAvailable,
 *          authorize(), refresh(), openPlayStore()
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {Linking, Alert, Platform} from 'react-native';
import {
  getSdkStatus,
  SdkAvailabilityStatus,
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
} from 'react-native-health-connect';

// ─── Health Connect Play Store URL ────────────
const HC_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';

// ─── Permissions ──────────────────────────────
const HC_PERMISSIONS = [
  {accessType: 'read', recordType: 'HeartRate'},
];

// ─── Default State ────────────────────────────
const DEFAULT_STATE = {
  hrReadings:             [],
  authorized:             false,
  loading:                false,
  error:                  null,
  healthConnectAvailable: null, // null=unknown | true=ready | false=unavailable
};

// ─── Context ──────────────────────────────────
const GoogleFitContext = createContext({
  ...DEFAULT_STATE,
  authorize:     async () => {},
  refresh:       async () => {},
  openPlayStore: () => {},
});

function toISO(date) { return date.toISOString(); }

// ─── Provider ─────────────────────────────────
export function GoogleFitProvider({children, refreshIntervalMs = 30_000}) {
  const [state, setState] = useState(DEFAULT_STATE);
  const intervalRef       = useRef(null);

  const setPartial = useCallback(
    partial => setState(prev => ({...prev, ...partial})),
    [],
  );

  // ── Open Play Store to install Health Connect
  const openPlayStore = useCallback(() => {
    Linking.openURL(HC_PLAY_STORE_URL).catch(() => {
      Alert.alert(
        'Cannot Open Play Store',
        'Please search for "Health Connect" in the Google Play Store manually.',
      );
    });
  }, []);

  // ── Check if Health Connect is available on this device
  // Returns true if ready, false + shows appropriate Alert if not
  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setPartial({
        healthConnectAvailable: false,
        error: 'Health Connect is Android only.',
      });
      return false;
    }

    try {
      const androidApiLevel = Platform.Version;
      const sdkStatus       = await getSdkStatus();

      if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
        // Not installed
        setPartial({
          healthConnectAvailable: false,
          error: 'Health Connect app is not installed. Please install it to connect your health data.',
        });

        return false;
      }

      if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        // Installed but outdated — prompt to update
        setPartial({
          healthConnectAvailable: false,
          error: 'Health Connect needs to be updated.',
        });
        
        return false;
      }

      // SDK_AVAILABLE — safe to initialize
      const isAvailable = await initialize();
      
      if (isAvailable) {
        setPartial({healthConnectAvailable: true});
        return true;
      }

      setPartial({
        healthConnectAvailable: false,
        error: 'Health Connect could not be initialized.',
      });
      return false;
    } catch (e) {
      setPartial({healthConnectAvailable: false, error: e.message});
      return false;
    }
  }, [openPlayStore, setPartial]);

  // ── Fetch all health data
  const fetchAll = useCallback(async () => {
    setPartial({loading: true, error: null});
    try {
      const now        = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // ── Heart Rate (last 1 hour)
      const hrResult   = await readRecords('HeartRate', {
        timeRangeFilter: {operator: 'between', startTime: toISO(oneHourAgo), endTime: toISO(now)},
      });
      const hrReadings = (hrResult?.records || [])
        .flatMap(r => (r.samples || []).map(s => ({
          value:     Math.round(s.beatsPerMinute),
          startDate: r.startTime,
          endDate:   r.endTime,
        })))
        .filter(s => s.value > 30 && s.value < 220)
        .slice(-50);

      console.log('Fetched Heart Rate readings from Health Connect:', hrReadings);

      setPartial({
        hrReadings,
        authorized: true,
        loading:    false,
        error:      null,
      });
    } catch (e) {
      setPartial({loading: false, error: e.message});
    }
  }, [setPartial]);

  // ── Authorize: availability check → permissions → fetch
  const authorize = useCallback(async () => {
    setPartial({loading: true, error: null});

    // Step 1 — is Health Connect available on this device?
    const available = await checkAvailability();
    if (!available) {
      setPartial({loading: false});
      return; // Alert already shown inside checkAvailability()
    }

    // Step 2 — request permissions
    try {
      await requestPermission(HC_PERMISSIONS);
      // requestPermission only returns newly granted permissions —
      // use getGrantedPermissions() to get the full set including previously granted
      const granted = await getGrantedPermissions();
      console.log('Granted permissions:', granted);
      const hasHR   = granted.some(p => p.recordType === 'HeartRate');
      console.log('Heart Rate permission granted:', hasHR);
      if (!hasHR) {
        setPartial({
          loading: false,
          error: 'Health Connect permissions denied. Tap "Connect" to try again.',
        });
        return;
      }

      // Step 3 — fetch data
      await fetchAll();
    } catch (e) {
      setPartial({loading: false, error: e.message});
    }
  }, [checkAvailability, fetchAll, setPartial]);

  // ── Auto-authorize on mount
  useEffect(() => {
    authorize();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Polling when authorized
  useEffect(() => {
    if (state.authorized) {
      intervalRef.current = setInterval(fetchAll, refreshIntervalMs);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.authorized, refreshIntervalMs, fetchAll]);

  return (
    <GoogleFitContext.Provider value={{...state, authorize, refresh: fetchAll, openPlayStore}}>
      {children}
    </GoogleFitContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────
export function useGoogleFit() {
  const ctx = useContext(GoogleFitContext);
  if (!ctx) throw new Error('useGoogleFit must be used inside GoogleFitProvider');
  return ctx;
}
