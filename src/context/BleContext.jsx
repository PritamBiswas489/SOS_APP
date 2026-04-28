/**
 * BleContext.jsx
 * Provides real-time BLE heart rate from smartwatch / chest strap.
 *
 * BLE Heart Rate Service UUID : 0x180D
 * HR Measurement Characteristic: 0x2A37
 *
 * Exposes: currentHR, hrBuffer, deviceName, connected,
 *          scanning, error, startScan(), disconnect()
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {atob} from 'react-native-quick-base64';

// ─── BLE UUIDs ────────────────────────────────
const HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_CHAR_UUID    = '00002a37-0000-1000-8000-00805f9b34fb';
const SCAN_TIMEOUT_MS = 15_000;
const MAX_HR_BUFFER   = 60; // keep last 60 readings

// ─── Parse BLE HR Measurement (0x2A37) ────────
// Flags byte bit-0: 0 = UINT8 format, 1 = UINT16 format
function parseHRCharacteristic(base64Value) {
  try {
    const raw   = atob(base64Value);
    const bytes = Array.from(raw).map(c => c.charCodeAt(0));
    const flags = bytes[0];
    const is16  = flags & 0x01;
    return is16 ? bytes[1] + (bytes[2] << 8) : bytes[1];
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────
const BleContext = createContext({
  currentHR: null,
  hrBuffer: [],
  deviceName: null,
  connected: false,
  scanning: false,
  error: null,
  startScan: async () => {},
  disconnect: async () => {},
});

// ─── Provider ─────────────────────────────────
export function BleProvider({children}) {
  const manager   = useRef(null);
  const deviceRef = useRef(null);
  const scanTimer = useRef(null);

  const [state, setState] = useState({
    currentHR: null,
    hrBuffer:  [],
    deviceName: null,
    connected: false,
    scanning:  false,
    error:     null,
  });

  const setPartial = useCallback(
    partial => setState(prev => ({...prev, ...partial})),
    [],
  );

  // ── Init BLE manager
  useEffect(() => {
    manager.current = new BleManager();
    return () => {
      clearTimeout(scanTimer.current);
      manager.current?.destroy();
    };
  }, []);

  // ── Android permissions
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const toRequest = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];
    // Android 12+
    if (Platform.Version >= 31) {
      toRequest.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    }
    const grants = await PermissionsAndroid.requestMultiple(toRequest);
    return Object.values(grants).every(
      v => v === PermissionsAndroid.RESULTS.GRANTED,
    );
  }, []);

  // ── Connect + subscribe to HR notifications
  const connectDevice = useCallback(async device => {
    try {
      const connected = await device.connect({autoConnect: true});
      await connected.discoverAllServicesAndCharacteristics();
      deviceRef.current = connected;

      setPartial({
        connected:  true,
        scanning:   false,
        deviceName: device.name || device.localName || 'HR Device',
        error:      null,
      });

      // Subscribe to HR notifications
      connected.monitorCharacteristicForService(
        HR_SERVICE_UUID,
        HR_CHAR_UUID,
        (err, characteristic) => {
          if (err) {
            setPartial({error: err.message});
            return;
          }
          const hr = parseHRCharacteristic(characteristic.value);
          if (hr && hr > 20 && hr < 250) {
            setState(prev => ({
              ...prev,
              currentHR: hr,
              hrBuffer: [...prev.hrBuffer.slice(-(MAX_HR_BUFFER - 1)), hr],
            }));
          }
        },
      );

      // Handle unexpected disconnection
      connected.onDisconnected((err) => {
        deviceRef.current = null;
        setPartial({
          connected:  false,
          deviceName: null,
          currentHR:  null,
          error: err ? 'Device disconnected unexpectedly' : null,
        });
      });
    } catch (e) {
      setPartial({scanning: false, error: e.message});
    }
  }, []);

  // ── Start BLE scan
  const startScan = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) {
      setPartial({error: 'Bluetooth permissions denied'});
      return;
    }

    setPartial({scanning: true, error: null});

    manager.current.startDeviceScan(
      [HR_SERVICE_UUID],
      {allowDuplicates: false},
      async (error, device) => {
        if (error) {
          setPartial({scanning: false, error: error.message});
          return;
        }
        if (device) {
          manager.current.stopDeviceScan();
          clearTimeout(scanTimer.current);
          await connectDevice(device);
        }
      },
    );

    // Auto-stop scan after timeout
    scanTimer.current = setTimeout(() => {
      manager.current.stopDeviceScan();
      setState(prev => ({
        ...prev,
        scanning: false,
        error: prev.connected ? null : 'No HR device found nearby',
      }));
    }, SCAN_TIMEOUT_MS);
  }, [connectDevice, requestPermissions]);

  // ── Disconnect
  const disconnect = useCallback(async () => {
    clearTimeout(scanTimer.current);
    manager.current?.stopDeviceScan();
    if (deviceRef.current) {
      try { await deviceRef.current.cancelConnection(); } catch (_) {}
      deviceRef.current = null;
    }
    setPartial({connected: false, deviceName: null, currentHR: null, scanning: false});
  }, []);

  return (
    <BleContext.Provider value={{...state, startScan, disconnect}}>
      {children}
    </BleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────
export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBle must be used inside BleProvider');
  return ctx;
}
