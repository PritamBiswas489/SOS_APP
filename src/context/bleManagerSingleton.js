/**
 * bleManagerSingleton.js
 *
 * Holds a single BleManager instance OUTSIDE React's component lifecycle.
 * Because this file does NOT export a React component, React Fast Refresh
 * never re-evaluates it during hot reload — so the manager survives
 * code changes without being destroyed and recreated.
 *
 * IMPORTANT: `_destroyed` is tracked explicitly rather than relying on any
 * internal/private property of BleManager (react-native-ble-plx does not
 * expose a public "is this destroyed" flag you can safely check).
 */
import {BleManager} from 'react-native-ble-plx';

let _manager   = null;
let _destroyed = false;

/**
 * Returns the existing BleManager or creates a new one if needed.
 * Safe to call multiple times — always returns the same live instance,
 * and will transparently recreate it if the previous one was destroyed.
 */
export function getBleManager() {
  if (!_manager || _destroyed) {
    _manager   = new BleManager();
    _destroyed = false;
  }
  return _manager;
}

/**
 * Call this only on true app close, or a genuine "feature fully off"
 * event (e.g. user logs out / disables BLE tracking entirely).
 *
 * Do NOT call this on hot reload, component unmount, or AppState
 * 'background'/'inactive' — those fire on routine app-switching and
 * would kill the live BLE connection (and background HR/SOS monitoring)
 * that this app depends on staying alive while backgrounded.
 */
export function destroyBleManager() {
  if (_manager) {
    _manager.destroy().catch(() => {});
    _manager   = null;
    _destroyed = true;
  }
}