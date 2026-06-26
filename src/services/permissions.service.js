import { Platform, PermissionsAndroid, AppState } from 'react-native'; // ✅ add AppState
import Geolocation from '@react-native-community/geolocation';

// ✅ Single safe wrapper for ALL PermissionsAndroid calls
const safeRequest = async (permission, rationale) => {
  if (AppState.currentState !== 'active') {
    console.warn('[Permissions] App not in foreground — skipping:', permission);
    return PermissionsAndroid.RESULTS.DENIED;
  }
  try {
    return await PermissionsAndroid.request(permission, rationale);
  } catch (err) {
    console.warn('[Permissions] IllegalStateException caught:', err.message);
    return PermissionsAndroid.RESULTS.DENIED; // ✅ graceful fallback
  }
};

const safeCheck = async (permission) => {
  try {
    return await PermissionsAndroid.check(permission);
  } catch (err) {
    console.warn('[Permissions] check error:', err.message);
    return false;
  }
};

export const requestAndroidLocationPermissions = async () => {
  const fgGranted = await safeRequest( // ✅ safeRequest instead of PermissionsAndroid.request
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Foreground Location Permission',
      message: 'This app needs access to your location.',
      buttonPositive: 'OK',
    },
  );

  if (fgGranted !== PermissionsAndroid.RESULTS.GRANTED) {
    return 'denied';
  }

  if (Platform.Version >= 29) {
    const bgGranted = await safeRequest( // ✅ safeRequest
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
    return bgGranted === PermissionsAndroid.RESULTS.GRANTED
      ? 'full'
      : 'foreground-only';
  }

  return 'full';
};

export const requestLocationPermissions = async () => {
  if (Platform.OS === 'android') {
    return requestAndroidLocationPermissions();
  }
  const auth = await Geolocation.requestAuthorization('always');
  return auth === 'granted' ? 'full' : auth;
};

export const requestMicrophonePermission = async () => {
  if (Platform.OS !== 'android') return 'granted';
  const result = await safeRequest( // ✅ safeRequest
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'This app needs microphone access to stream live audio during an SOS.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
};

export const requestNotificationPermissions = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) return 'granted';
  const result = await safeRequest( // ✅ safeRequest
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Notification Permission',
      message: 'Allow notifications to receive SOS alerts.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
};

export const checkRequiredPermissions = async () => {
  const missing = [];

  if (Platform.OS === 'android') {
    const fgLocation = await safeCheck( // ✅ safeCheck
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    let bgLocation = true;
    if (Platform.Version >= 29) {
      bgLocation = await safeCheck( // ✅ safeCheck
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
    }
    if (!fgLocation || !bgLocation) missing.push('location');

    if (Platform.Version >= 33) {
      const notif = await safeCheck( // ✅ safeCheck
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (!notif) missing.push('notification');
    }

    const mic = await safeCheck( // ✅ safeCheck
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (!mic) missing.push('microphone');
  }

  return missing;
};